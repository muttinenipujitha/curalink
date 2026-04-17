const axios = require('axios');

// ─── LLM Provider Selection ────────────────────────────────────────────────
// Priority: Groq (free, fast, cloud) → HuggingFace (free, cloud) → Ollama (local) → Fallback
const GROQ_API_KEY   = process.env.GROQ_API_KEY   || '';
const HF_API_KEY     = process.env.HF_API_KEY      || '';
const OLLAMA_BASE    = process.env.OLLAMA_BASE_URL  || 'http://localhost:11434';
const MODEL          = process.env.LLM_MODEL        || 'llama-3.1-8b-instant'; // groq default

function getProvider() {
  if (GROQ_API_KEY)  return 'groq';
  if (HF_API_KEY)    return 'huggingface';
  return 'ollama'; // local fallback
}

/**
 * Expand user query intelligently using LLM
 */
async function expandQuery(disease, userQuery, additionalContext = '') {
  const prompt = `You are a medical research query expansion expert.

Given:
- Disease: ${disease}
- User Query: ${userQuery}
- Additional Context: ${additionalContext}

Generate 3 optimized search queries that will find the most relevant medical research papers and clinical trials.
Each query should combine the disease with specific medical terminology.

Respond in JSON format ONLY:
{
  "queries": ["query1", "query2", "query3"],
  "intent": "brief description of user's intent"
}`;

  try {
    const res = await callLLM(prompt, 300);
    const text = extractText(res);
    
    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        queries: parsed.queries || [`${disease} ${userQuery}`],
        intent: parsed.intent || userQuery
      };
    }
  } catch (e) {
    console.error('Query expansion error:', e.message);
  }
  
  // Fallback
  return {
    queries: [
      `${disease} ${userQuery}`,
      `${disease} treatment research`,
      `${disease} clinical study`
    ],
    intent: userQuery
  };
}

/**
 * Re-rank publications by relevance using LLM scoring
 */
async function rankPublications(publications, query, disease) {
  if (publications.length <= 8) return publications;
  
  // Simple keyword scoring (fast, no LLM needed for ranking)
  const queryWords = `${query} ${disease}`.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  
  const scored = publications.map(pub => {
    const text = `${pub.title} ${pub.abstract}`.toLowerCase();
    let score = 0;
    
    queryWords.forEach(word => {
      const titleCount = (pub.title?.toLowerCase().match(new RegExp(word, 'g')) || []).length;
      const abstractCount = (pub.abstract?.toLowerCase().match(new RegExp(word, 'g')) || []).length;
      score += titleCount * 3 + abstractCount;
    });
    
    // Boost by recency
    const year = parseInt(pub.year) || 2000;
    score += Math.max(0, (year - 2018) * 2);
    
    // Boost by citations (OpenAlex)
    if (pub.citedBy) score += Math.min(pub.citedBy / 10, 20);
    
    return { ...pub, relevanceScore: score };
  });

  return scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Generate the main research response using LLM
 */
async function generateResearchResponse(params) {
  const {
    query,
    disease,
    patientContext,
    publications,
    trials,
    conversationHistory = [],
    intent
  } = params;

  // Build context from conversation history
  const historyContext = conversationHistory
    .slice(-6) // Last 3 exchanges
    .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content.slice(0, 200)}`)
    .join('\n');

  // Prepare publications summary
  const pubsSummary = publications.slice(0, 6).map((p, i) => 
    `[${i+1}] Title: ${p.title}\nAuthors: ${p.authors?.slice(0,3).join(', ')}\nYear: ${p.year}\nKey Finding: ${p.abstract?.slice(0, 300)}...\nSource: ${p.source} | URL: ${p.url}`
  ).join('\n\n');

  // Prepare trials summary
  const trialsSummary = trials.slice(0, 4).map((t, i) =>
    `[T${i+1}] Title: ${t.title}\nStatus: ${t.status} | Phase: ${t.phase}\nLocation: ${t.locations?.join(', ') || 'Multiple'}\nContact: ${t.contact?.email || t.contact?.phone || 'See trial link'}\nURL: ${t.url}`
  ).join('\n\n');

  const patientInfo = patientContext?.name ? 
    `Patient: ${patientContext.name}${patientContext.location ? `, Location: ${patientContext.location}` : ''}` : '';

  const systemPrompt = `You are Curalink, an expert AI Medical Research Assistant. You analyze peer-reviewed research and clinical trials to provide accurate, evidence-based medical insights.

IMPORTANT RULES:
1. Always cite publications using [1], [2] etc notation
2. Never fabricate or hallucinate information
3. Clearly distinguish between established treatments and emerging research
4. Always recommend consulting a healthcare professional
5. Provide structured, well-organized responses
6. Be specific and research-backed, not generic`;

  const userPrompt = `${patientInfo ? `Patient Context: ${patientInfo}\n` : ''}
${historyContext ? `Previous Conversation:\n${historyContext}\n` : ''}

Current Query: "${query}"
Disease/Condition: ${disease}
User Intent: ${intent}

Available Research Publications:
${pubsSummary || 'No publications retrieved'}

Available Clinical Trials:
${trialsSummary || 'No active clinical trials found'}

Please provide a comprehensive, structured research response with these sections:
1. **Condition Overview** - Brief overview of ${disease} relevant to the query
2. **Key Research Insights** - Evidence-based insights from the publications above (cite them!)
3. **Current Treatment Landscape** - What the research says about treatments
4. **Clinical Trial Opportunities** - Relevant trials if applicable
5. **Personalized Insights** - Specific to the patient context if available
6. **Important Disclaimer** - Recommend consulting healthcare professionals

Format clearly with markdown headers. Be thorough but concise. Cite sources.`;

  try {
    const res = await callLLM(`${systemPrompt}\n\n${userPrompt}`, 1500);
    return extractText(res);
  } catch (e) {
    console.error('LLM generation error:', e.message);
    return generateFallbackResponse(query, disease, publications, trials);
  }
}

/**
 * Universal LLM caller — tries providers in order
 */
async function callLLM(prompt, maxTokens = 1000) {
  const provider = getProvider();

  if (provider === 'groq') {
    return callGroq(prompt, maxTokens);
  } else if (provider === 'huggingface') {
    return callHuggingFace(prompt, maxTokens);
  } else {
    return callOllama(prompt, maxTokens);
  }
}

/**
 * Groq — free tier, very fast, cloud-based
 * Free at: https://console.groq.com  (no credit card)
 * Models: llama-3.1-8b-instant, llama-3.3-70b-versatile, mixtral-8x7b-32768, gemma2-9b-it
 */
async function callGroq(prompt, maxTokens = 1000) {
  const model = MODEL || 'llama-3.1-8b-instant';
  const res = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.3,
    },
    {
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  );
  return { response: res.data.choices?.[0]?.message?.content || '' };
}

/**
 * HuggingFace Inference API — free tier
 * Free at: https://huggingface.co/settings/tokens  (no credit card)
 */
async function callHuggingFace(prompt, maxTokens = 800) {
  const model = 'mistralai/Mistral-7B-Instruct-v0.3';
  const res = await axios.post(
    `https://api-inference.huggingface.co/models/${model}`,
    {
      inputs: prompt,
      parameters: { max_new_tokens: maxTokens, temperature: 0.3, return_full_text: false },
    },
    {
      headers: { Authorization: `Bearer ${HF_API_KEY}` },
      timeout: 60000,
    }
  );
  const text = Array.isArray(res.data)
    ? res.data[0]?.generated_text || ''
    : res.data?.generated_text || '';
  return { response: text };
}

/**
 * Ollama — local fallback (if installed)
 */
async function callOllama(prompt, maxTokens = 1000) {
  const res = await axios.post(
    `${OLLAMA_BASE}/api/generate`,
    {
      model: MODEL || 'mistral',
      prompt,
      stream: false,
      options: { num_predict: maxTokens, temperature: 0.3, top_p: 0.9 },
    },
    { timeout: 120000 }
  );
  return res.data;
}

function extractText(response) {
  return response?.response || response?.message?.content || '';
}

/**
 * Fallback response when LLM is unavailable
 */
function generateFallbackResponse(query, disease, publications, trials) {
  const pubList = publications.slice(0, 6).map((p, i) => 
    `**[${i+1}] ${p.title}** (${p.year})\n${p.authors?.slice(0,3).join(', ')}\n*${p.abstract?.slice(0, 200)}...*\n🔗 [Read more](${p.url})`
  ).join('\n\n');

  const trialList = trials.slice(0, 4).map((t, i) =>
    `**[T${i+1}] ${t.title}**\nStatus: ${t.status} | Phase: ${t.phase}\nLocations: ${t.locations?.join(', ') || 'Multiple'}\n🔗 [View Trial](${t.url})`
  ).join('\n\n');

  return `## Research Summary: ${disease} — ${query}

> ⚠️ *LLM is offline. Showing raw retrieved research results.*

## 📚 Relevant Publications

${pubList || 'No publications found for this query.'}

## 🧪 Clinical Trials

${trialList || 'No active clinical trials found.'}

---
*⚠️ This is an automated retrieval summary. Please consult a qualified healthcare professional for medical advice.*`;
}

/**
 * Health check — detects which provider is active
 */
async function checkOllamaHealth() {
  const provider = getProvider();

  if (provider === 'groq') {
    try {
      const res = await axios.get('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
        timeout: 5000,
      });
      const models = res.data?.data?.map(m => m.id) || [];
      return { online: true, provider: 'groq', models: models.slice(0, 5) };
    } catch {
      return { online: false, provider: 'groq', models: [] };
    }
  }

  if (provider === 'huggingface') {
    return { online: true, provider: 'huggingface', models: ['Mistral-7B-Instruct-v0.3'] };
  }

  // Ollama
  try {
    const res = await axios.get(`${OLLAMA_BASE}/api/tags`, { timeout: 5000 });
    const models = res.data?.models?.map(m => m.name) || [];
    return { online: true, provider: 'ollama', models };
  } catch {
    return { online: false, provider: 'ollama', models: [] };
  }
}

module.exports = { expandQuery, rankPublications, generateResearchResponse, checkOllamaHealth };
