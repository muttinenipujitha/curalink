const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('crypto').randomUUID ? { v4: () => require('crypto').randomUUID() } : { v4: () => Date.now().toString(36) + Math.random().toString(36).substr(2) };

const { fetchPubMed } = require('../services/pubmedService');
const { fetchOpenAlex } = require('../services/openAlexService');
const { fetchClinicalTrials } = require('../services/clinicalTrialsService');
const { expandQuery, rankPublications, generateResearchResponse, checkOllamaHealth } = require('../services/llmService');
const { getOrCreateSession, addMessage, getSession } = require('../services/sessionManager');

/**
 * POST /api/chat
 * Main chat endpoint — full pipeline
 */
router.post('/', async (req, res) => {
  try {
    const {
      message,
      sessionId,
      patientContext = {}  // { name, disease, location, additionalInfo }
    } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or create session
    const sid = sessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const session = await getOrCreateSession(sid, patientContext);
    const conversationHistory = session?.messages || [];

    // Determine disease context (from current message, patient context, or conversation history)
    let disease = patientContext.disease || '';
    if (!disease && conversationHistory.length > 0) {
      // Extract from last patient context in history
      disease = session?.patientContext?.disease || '';
    }
    if (!disease) {
      // Try to extract from message itself
      disease = extractDiseaseFromMessage(message);
    }

    console.log(`\n🔍 Query: "${message}" | Disease: "${disease}" | Session: ${sid}`);

    // ═══════════════════════════════════════════
    // STEP 1: QUERY EXPANSION
    // ═══════════════════════════════════════════
    let expandedQueries = { queries: [`${disease} ${message}`.trim()], intent: message };
    
    try {
      expandedQueries = await expandQuery(disease, message, patientContext.additionalInfo || '');
      console.log(`📝 Expanded queries: ${expandedQueries.queries.join(' | ')}`);
    } catch (e) {
      console.log('Query expansion skipped (LLM offline)');
    }

    // ═══════════════════════════════════════════
    // STEP 2: PARALLEL DATA RETRIEVAL (50-300 results)
    // ═══════════════════════════════════════════
    const primaryQuery = expandedQueries.queries[0] || `${disease} ${message}`.trim();
    const secondaryQuery = expandedQueries.queries[1] || `${disease} treatment`;

    console.log(`🌐 Fetching from PubMed, OpenAlex, ClinicalTrials...`);

    const [pubmedResults, openAlexResults, trialsResults] = await Promise.allSettled([
      fetchPubMed(primaryQuery, 60),
      fetchOpenAlex(secondaryQuery, 80),
      fetchClinicalTrials(disease || message, message, patientContext.location || '', 20)
    ]);

    // Collect results
    const pubmedPubs = pubmedResults.status === 'fulfilled' ? pubmedResults.value : [];
    const openAlexPubs = openAlexResults.status === 'fulfilled' ? openAlexResults.value : [];
    let allTrials = trialsResults.status === 'fulfilled' ? trialsResults.value : [];

    console.log(`📊 Retrieved: PubMed=${pubmedPubs.length} | OpenAlex=${openAlexPubs.length} | Trials=${allTrials.length}`);

    // ═══════════════════════════════════════════
    // STEP 3: MERGE & DE-DUPLICATE PUBLICATIONS
    // ═══════════════════════════════════════════
    const allPubs = deduplicateByTitle([...pubmedPubs, ...openAlexPubs]);
    console.log(`🔗 After deduplication: ${allPubs.length} unique publications`);

    // ═══════════════════════════════════════════
    // STEP 4: RANK & FILTER (top 6-8)
    // ═══════════════════════════════════════════
    const rankedPubs = await rankPublications(allPubs, message, disease);
    const topPublications = rankedPubs.slice(0, 8);
    const topTrials = allTrials.slice(0, 6);

    console.log(`✅ Final: ${topPublications.length} publications, ${topTrials.length} trials`);

    // ═══════════════════════════════════════════
    // STEP 5: LLM REASONING & RESPONSE GENERATION
    // ═══════════════════════════════════════════
    const aiResponse = await generateResearchResponse({
      query: message,
      disease: disease || message,
      patientContext,
      publications: topPublications,
      trials: topTrials,
      conversationHistory,
      intent: expandedQueries.intent
    });

    // ═══════════════════════════════════════════
    // STEP 6: SAVE TO SESSION
    // ═══════════════════════════════════════════
    await addMessage(sid, {
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    await addMessage(sid, {
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
      metadata: {
        publications: topPublications,
        trials: topTrials,
        queryExpanded: primaryQuery
      }
    });

    // ═══════════════════════════════════════════
    // RESPONSE
    // ═══════════════════════════════════════════
    res.json({
      sessionId: sid,
      response: aiResponse,
      publications: topPublications,
      trials: topTrials,
      meta: {
        totalRetrieved: allPubs.length,
        totalTrials: allTrials.length,
        expandedQuery: primaryQuery,
        intent: expandedQueries.intent,
        sources: {
          pubmed: pubmedPubs.length,
          openalex: openAlexPubs.length,
          trials: allTrials.length
        }
      }
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process query',
      details: error.message 
    });
  }
});

/**
 * GET /api/chat/health
 */
router.get('/health', async (req, res) => {
  const llm = await checkOllamaHealth();
  res.json({ 
    status: 'ok', 
    llm,
    model: process.env.LLM_MODEL || 'mistral'
  });
});

// Helpers
function deduplicateByTitle(publications) {
  const seen = new Set();
  return publications.filter(pub => {
    const key = pub.title?.toLowerCase().slice(0, 60);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function extractDiseaseFromMessage(message) {
  const diseases = [
    'cancer', 'diabetes', 'parkinson', 'alzheimer', 'heart disease', 'lung cancer',
    'breast cancer', 'covid', 'hypertension', 'stroke', 'arthritis', 'depression',
    'anxiety', 'obesity', 'asthma', 'copd', 'kidney disease', 'liver disease',
    'multiple sclerosis', 'epilepsy', 'HIV', 'AIDS', 'tuberculosis', 'malaria'
  ];
  
  const lower = message.toLowerCase();
  for (const d of diseases) {
    if (lower.includes(d)) return d;
  }
  return message.split(' ').slice(0, 3).join(' ');
}

module.exports = router;
