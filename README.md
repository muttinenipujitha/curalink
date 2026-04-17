# ⚕ Curalink — AI Medical Research Assistant

> A full-stack MERN AI system that retrieves, ranks, and reasons over live medical research from PubMed, OpenAlex, and ClinicalTrials.gov — powered by Groq (free cloud LLM, no downloads needed).

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Stack](https://img.shields.io/badge/stack-MERN-blue)
![LLM](https://img.shields.io/badge/LLM-Groq%20%7C%20HuggingFace%20%7C%20Ollama-purple)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🏗 Architecture Overview

```
User Query
    │
    ▼
┌─────────────────────────────────────────────────┐
│           React Frontend  (Port 3000)            │
│   Sidebar (Patient Context) + Chat Interface     │
└────────────────────────┬────────────────────────┘
                         │ POST /api/chat
                         ▼
┌─────────────────────────────────────────────────┐
│           Express Backend  (Port 5000)           │
│                                                  │
│  Step 1 — Query Expansion  (LLM)                 │
│  Step 2 — Parallel Retrieval                     │
│           ├── PubMed API        (~60 results)    │
│           ├── OpenAlex API      (~80 results)    │
│           └── ClinicalTrials.gov (~20 results)   │
│  Step 3 — Deduplication + Re-ranking             │
│  Step 4 — LLM Reasoning & Response Generation   │
│  Step 5 — Session Storage                        │
└────────────────────────┬────────────────────────┘
                         │
       ┌─────────────────┼─────────────────┐
       ▼                 ▼                 ▼
  Groq / HF /       MongoDB Atlas      Free APIs
  Ollama (LLM)      (optional)       (no key needed)
```

---

## ✨ Features

- **Deep Retrieval** — Fetches 50–300 results across 3 sources, filters to best 8
- **Query Expansion** — LLM rewrites your query into 3 optimized search terms
- **Clinical Trials** — Live data from ClinicalTrials.gov with eligibility & contact info
- **Context Aware** — Multi-turn conversations with full patient context (name, disease, location)
- **Source Attribution** — Every result shows title, authors, year, source badge, and URL
- **LLM Fallback** — If LLM is offline, raw research results still display
- **No paid APIs** — All data sources are 100% free

---

## 📋 Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ | Comes with Node.js |
| Groq API Key | free | https://console.groq.com |
| MongoDB Atlas | free | https://mongodb.com/atlas (optional) |

> Groq is a **free cloud LLM** — no GPU, no downloads, no disk space needed.

---

## 🚀 Quick Start (5 minutes)

### Step 1 — Get a Free Groq API Key

1. Go to **https://console.groq.com**
2. Sign up (no credit card required)
3. Click **API Keys → Create API Key**
4. Copy the key — it starts with `gsk_...`

---

### Step 2 — Setup the Backend

```bash
cd curalink/backend
npm install
cp .env.example .env
```

Open `.env` and fill in:

```env
GROQ_API_KEY=gsk_your_key_here
LLM_MODEL=llama-3.1-8b-instant
PORT=5000
FRONTEND_URL=http://localhost:3000
MONGODB_URI=
```

Start the backend:

```bash
npm run dev
```

You should see:
```
✅ MongoDB URI not set — running without DB (sessions stored in memory)
🚀 Curalink server running on port 5000
🤖 LLM Model: llama-3.1-8b-instant
```

---

### Step 3 — Setup the Frontend

```bash
cd ../frontend
npm install
npm start
```

Browser opens at **http://localhost:3000**

The status bar at the top should show:
> 🟢 ⚡ Groq · llama-3.1-8b-instant · PubMed · OpenAlex · ClinicalTrials.gov

---

## 🤖 LLM Provider Options (All Free)

The app auto-detects which provider to use based on which key is set in `.env`.

| Provider | Speed | Setup | Disk Space |
|----------|-------|-------|------------|
| **Groq** ⭐ Recommended | ⚡ Very fast (~500 tok/s) | Free key at console.groq.com | 0 MB |
| **HuggingFace** | 🐢 Slower | Free token at huggingface.co | 0 MB |
| **Ollama** | ✅ Good (local) | Install + pull model | 4–8 GB |

**Groq model options** (set in `.env` as `LLM_MODEL`):

| Model | Quality | Speed |
|-------|---------|-------|
| `llama-3.1-8b-instant` | Great | Fastest |
| `llama-3.3-70b-versatile` | Best | Fast |
| `mixtral-8x7b-32768` | Great | Fast |
| `gemma2-9b-it` | Good | Fast |

---

## 📊 Pipeline Details

### 1. Query Expansion
LLM generates 3 optimized queries from your input:
```
Input:  disease="parkinson", query="deep brain stimulation"
Output: ["parkinson's disease deep brain stimulation clinical outcomes",
         "DBS neurostimulation parkinson treatment efficacy",
         "parkinson disease surgical intervention research"]
```

### 2. Retrieval — Depth First, Then Precision

| Source | Fetched | Final Shown |
|--------|---------|-------------|
| PubMed | ~60 | top 4 |
| OpenAlex | ~80 | top 4 |
| ClinicalTrials.gov | ~20 | top 6 |
| **Total** | **~160** | **8 pubs + 6 trials** |

### 3. Ranking Algorithm
1. Keyword frequency (title = 3× weight vs abstract)
2. Recency boost (+2 per year after 2018)
3. Citation count (OpenAlex `cited_by_count`)

### 4. LLM Response Generation
The LLM receives and reasons over:
- Top 6 publications with abstracts
- Top 4 clinical trials
- Patient context (name, disease, location)
- Last 3 conversation turns (6 messages)

Output sections:
- **Condition Overview**
- **Key Research Insights** (with `[1]` `[2]` citations)
- **Current Treatment Landscape**
- **Clinical Trial Opportunities**
- **Personalized Insights**
- **Disclaimer**

---

## 🎯 Demo Queries

Use these for your demo or Loom recording:

| Query | Set Disease To |
|-------|---------------|
| Latest treatment for lung cancer | lung cancer |
| Clinical trials for diabetes | diabetes |
| Top researchers in Alzheimer's disease | alzheimer's |
| Recent studies on heart disease | heart disease |
| Deep Brain Stimulation | parkinson's disease |
| *(follow-up)* Can I take Vitamin D? | *(uses previous context)* |

---

## 🔧 Troubleshooting

### "LLM Offline" in status bar
- Check `GROQ_API_KEY` is set correctly in `backend/.env`
- Restart the backend after editing `.env`
- Verify key works: `curl https://api.groq.com/openai/v1/models -H "Authorization: Bearer YOUR_KEY"`

### Backend won't start
```bash
node --version   # must be 18+
rm -rf node_modules && npm install
```

### Frontend shows blank page
```bash
# Make sure backend is running first, then:
cd frontend && npm start
```

### Slow first response
- Normal — APIs have cold start on first call
- Subsequent queries are much faster

### MongoDB error
- Leave `MONGODB_URI=` blank in `.env`
- App works fully without MongoDB (sessions stored in memory)

---

## 🌐 Free Deployment

### Backend → Render.com

1. Push code to GitHub
2. Go to **render.com** → New Web Service
3. Connect your repo → set root to `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables in the Render dashboard (same as your `.env`)

### Frontend → Vercel

1. Push code to GitHub
2. Go to **vercel.com** → Import project
3. Set root to `frontend`
4. Add environment variable: `REACT_APP_API_URL=https://your-render-url.onrender.com`
5. Deploy

---

## 📁 Project Structure

```
curalink/
├── backend/
│   ├── server.js                  # Express entry point
│   ├── .env.example               # Environment template
│   ├── routes/
│   │   ├── chat.js                # Main AI pipeline endpoint
│   │   ├── research.js            # Direct research API access
│   │   └── sessions.js            # Session management
│   ├── services/
│   │   ├── llmService.js          # Groq / HuggingFace / Ollama
│   │   ├── pubmedService.js       # PubMed NCBI API
│   │   ├── openAlexService.js     # OpenAlex API
│   │   ├── clinicalTrialsService.js # ClinicalTrials.gov API
│   │   ├── sessionManager.js      # MongoDB or memory sessions
│   │   └── memoryStore.js         # In-memory session fallback
│   └── models/
│       └── Session.js             # MongoDB schema
├── frontend/
│   ├── public/index.html
│   └── src/
│       ├── App.js
│       ├── index.js
│       ├── index.css
│       ├── context/
│       │   └── ChatContext.js     # Global chat state
│       ├── services/
│       │   └── api.js             # Axios API client
│       └── components/
│           ├── Sidebar.js         # Patient context + quick queries
│           ├── ChatWindow.js      # Main chat area + welcome screen
│           ├── ChatInput.js       # Message input with suggestions
│           ├── Message.js         # Message bubble with tabs
│           ├── PublicationCard.js # Research paper card
│           ├── TrialCard.js       # Clinical trial card
│           ├── TypingIndicator.js # Loading animation
│           └── StatusBar.js       # LLM + API health indicator
└── README.md
```

---

## ⚠️ Disclaimer

This tool is for **research and educational purposes only**. It does not provide medical advice. Always consult a qualified healthcare professional for any medical decisions.

---

## 📄 License

MIT — free to use and modify.
