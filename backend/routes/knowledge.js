// backend/routes/knowledge.js
// Express Router for Equipment Specification Grounding and ISO Standards

const express = require('express');
const router = express.Router();
const knowledgeService = require('../services/knowledgeService');

// GET /api/knowledge/:equipment - Retrieve grounded datasheet specs and vibration standards
router.get('/:equipment', (req, res) => {
  try {
    const equipment = req.params.equipment;
    const data = knowledgeService.getEquipmentKnowledge(equipment);
    res.json(data);
  } catch (err) {
    console.error('[ERROR] Knowledge lookup error:', err);
    res.status(500).json({ error: 'Internal server error retrieving equipment knowledge' });
  }
});

module.exports = router;
