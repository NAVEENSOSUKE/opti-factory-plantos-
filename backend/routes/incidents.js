// backend/routes/incidents.js
// Express Router for Incident CRUD and Verification operations

const express = require('express');
const router = express.Router();
const incidentService = require('../services/incidentService');

// GET /api/incidents - Retrieve incident history from SQLite database
router.get('/', (req, res) => {
  try {
    const list = incidentService.getIncidents();
    res.json(list);
  } catch (err) {
    console.error('[ERROR] Failed to get incidents:', err);
    res.status(500).json({ error: 'Internal server error retrieving incidents' });
  }
});

// GET /api/incidents/:id - Retrieve complete details for a specific incident
router.get('/:id', (req, res) => {
  try {
    const id = req.params.id;
    if (!id || id.trim() === '') {
      return res.status(400).json({ error: 'Valid incident ID is required' });
    }

    const item = incidentService.getIncidentById(id);
    if (!item) {
      return res.status(404).json({ error: `Incident ${id} not found` });
    }

    res.json(item);
  } catch (err) {
    console.error(`[ERROR] Failed to get incident ${req.params.id}:`, err);
    res.status(500).json({ error: 'Internal server error retrieving incident' });
  }
});

// POST /api/incidents - Create a new machine anomaly incident
router.post('/', (req, res) => {
  try {
    const body = req.body;
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const created = incidentService.createIncident(body);
    res.status(201).json(created);
  } catch (err) {
    console.error('[ERROR] Failed to create incident:', err.message);
    res.status(400).json({ error: err.message || 'Failed to create incident' });
  }
});

// PATCH /api/incidents/:id - Update status, resolution, downtime, rootCause, or state
router.patch('/:id', (req, res) => {
  try {
    const id = req.params.id;
    if (!id || id.trim() === '') {
      return res.status(400).json({ error: 'Valid incident ID is required' });
    }

    const updated = incidentService.updateIncident(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: `Incident ${id} not found` });
    }

    res.json(updated);
  } catch (err) {
    console.error(`[ERROR] Failed to update incident ${req.params.id}:`, err.message);
    res.status(400).json({ error: err.message || 'Failed to update incident' });
  }
});

// POST /api/incidents/:id/verify - Simulate vibration return to normal and verify closure readiness
router.post('/:id/verify', (req, res) => {
  try {
    const id = req.params.id;
    if (!id || id.trim() === '') {
      return res.status(400).json({ error: 'Valid incident ID is required' });
    }

    const result = incidentService.verifyIncident(id);
    if (!result) {
      return res.status(404).json({ error: `Incident ${id} not found` });
    }

    res.json(result);
  } catch (err) {
    console.error(`[ERROR] Verification failed for ${req.params.id}:`, err.message);
    res.status(500).json({ error: err.message || 'Verification execution failed' });
  }
});

module.exports = router;
