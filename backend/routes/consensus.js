// backend/routes/consensus.js
// Express Router for 5-Persona Cross-Functional Consensus Deliberation

const express = require('express');
const router = express.Router();
const consensusService = require('../services/consensusService');

// POST /api/consensus - Run multi-agent consensus deliberation
router.post('/', async (req, res) => {
  try {
    const { incidentId } = req.body || {};
    const result = await consensusService.runConsensus({ incidentId });
    res.json(result);
  } catch (err) {
    console.error('[ERROR] Consensus deliberation error:', err.message);
    res.status(500).json({ error: err.message || 'Consensus generation failed' });
  }
});

module.exports = router;
