// backend/routes/ai.js
// Express Router for AI Orchestrator Health and Status

const express = require('express');
const router = express.Router();
const aiOrchestrator = require('../services/aiOrchestrator');

// GET /api/ai/status - Return AI engine availability, mode, and model (NEVER leaks API key)
router.get('/status', (req, res) => {
  try {
    const status = aiOrchestrator.getAiStatus();
    res.json(status);
  } catch (err) {
    console.error('[ERROR] Failed to retrieve AI status:', err.message);
    res.status(500).json({
      available: false,
      provider: null,
      model: null,
      mode: 'LOCAL_REASONING',
      error: 'Failed to inspect AI engine'
    });
  }
});

module.exports = router;
