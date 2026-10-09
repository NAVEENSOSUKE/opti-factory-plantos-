// backend/routes/agents.js
// Express Router for AI Specialist Cognitive Analysis

const express = require('express');
const router = express.Router();
const agentService = require('../services/agentService');

// POST /api/agents/analyze - Execute specialist persona analysis on an incident
router.post('/analyze', async (req, res) => {
  try {
    const { incidentId, persona } = req.body || {};
    const result = await agentService.analyzeIncident({ incidentId, persona });
    res.json(result);
  } catch (err) {
    console.error('[ERROR] Agent analysis error:', err.message);
    res.status(500).json({ error: err.message || 'Agent analysis failed' });
  }
});

module.exports = router;
