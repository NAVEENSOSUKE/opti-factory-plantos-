// backend/routes/telemetry.js
// Express Router for Telemetry data streams and anomaly detection

const express = require('express');
const router = express.Router();
const telemetryService = require('../services/telemetryService');

// GET /api/telemetry/line-c - Retrieve current telemetry timeline for Line C
router.get('/line-c', (req, res) => {
  try {
    const list = telemetryService.getLineCTelemetry();
    res.json(list);
  } catch (err) {
    console.error('[ERROR] Failed to fetch Line C telemetry:', err);
    res.status(500).json({ error: 'Internal server error retrieving telemetry' });
  }
});

// POST /api/telemetry/line-c - Ingest telemetry data point and check threshold anomaly
router.post('/line-c', (req, res) => {
  try {
    const body = req.body;
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Invalid telemetry payload' });
    }

    const result = telemetryService.recordLineCTelemetry(body);
    res.status(201).json(result);
  } catch (err) {
    console.error('[ERROR] Telemetry ingestion error:', err.message);
    res.status(400).json({ error: err.message || 'Failed to record telemetry' });
  }
});

module.exports = router;
