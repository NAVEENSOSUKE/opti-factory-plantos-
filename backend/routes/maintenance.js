// backend/routes/maintenance.js
// Express Router for Industrial Maintenance Execution Cycles

const express = require('express');
const router = express.Router();
const maintenanceService = require('../services/maintenanceService');

// POST /api/maintenance/start - Begin physical maintenance and LOTO procedures
router.post('/start', (req, res) => {
  try {
    const { incidentId } = req.body || {};
    const result = maintenanceService.startMaintenance({ incidentId });
    res.json(result);
  } catch (err) {
    console.error('[ERROR] Start maintenance error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to start maintenance' });
  }
});

// POST /api/maintenance/complete - Mark maintenance actions complete and advance to verification
router.post('/complete', (req, res) => {
  try {
    const { incidentId } = req.body || {};
    const result = maintenanceService.completeMaintenance({ incidentId });
    res.json(result);
  } catch (err) {
    console.error('[ERROR] Complete maintenance error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to complete maintenance' });
  }
});

module.exports = router;
