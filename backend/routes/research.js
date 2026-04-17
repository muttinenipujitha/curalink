const express = require('express');
const router = express.Router();
const { fetchPubMed } = require('../services/pubmedService');
const { fetchOpenAlex } = require('../services/openAlexService');
const { fetchClinicalTrials } = require('../services/clinicalTrialsService');

// GET /api/research/publications?query=...&disease=...
router.get('/publications', async (req, res) => {
  try {
    const { query = '', disease = '' } = req.query;
    const searchQuery = `${disease} ${query}`.trim();
    
    const [pubmed, openalex] = await Promise.allSettled([
      fetchPubMed(searchQuery, 40),
      fetchOpenAlex(searchQuery, 40)
    ]);
    
    const all = [
      ...(pubmed.status === 'fulfilled' ? pubmed.value : []),
      ...(openalex.status === 'fulfilled' ? openalex.value : [])
    ];
    
    res.json({ publications: all, total: all.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/research/trials?disease=...&location=...
router.get('/trials', async (req, res) => {
  try {
    const { disease = '', location = '', query = '' } = req.query;
    const trials = await fetchClinicalTrials(disease, query, location, 20);
    res.json({ trials, total: trials.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
