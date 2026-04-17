const express = require('express');
const router = express.Router();
const { getSession, getAllSessions } = require('../services/sessionManager');

// GET /api/sessions - list recent sessions
router.get('/', async (req, res) => {
  try {
    const sessions = await getAllSessions();
    res.json({ sessions });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/sessions/:sessionId
router.get('/:sessionId', async (req, res) => {
  try {
    const session = await getSession(req.params.sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json({ session });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
