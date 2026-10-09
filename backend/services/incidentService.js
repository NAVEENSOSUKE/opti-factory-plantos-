// backend/services/incidentService.js
// Business logic for industrial incidents lifecycle

const db = require('../data/database');

class IncidentService {
  getIncidents() {
    return db.getIncidents();
  }

  getIncidentById(id) {
    if (!id || typeof id !== 'string') {
      return null;
    }
    return db.getIncidentById(id.trim());
  }

  createIncident(data) {
    if (!data) {
      throw new Error('Incident data is required');
    }

    const line = data.line || 'Line C';
    const machine = data.machine || 'Powertrain & Vibratory Feeder #2';
    const type = data.type || 'Vibration Anomaly';
    const severity = (data.severity || 'HIGH').toUpperCase();
    const value = typeof data.value === 'number' ? data.value : 4.2;
    const threshold = typeof data.threshold === 'number' ? data.threshold : 3.5;

    // Validate numeric range
    if (value < 0 || value > 200) {
      throw new Error('Vibration reading value is outside permissible physics range');
    }

    // Determine ID
    let id = data.id;
    if (!id) {
      // Generate ID like INC-LC-001 or sequential
      const existing = db.getIncidents();
      const lineCode = line.toLowerCase().includes('c') ? 'LC' : line.toLowerCase().includes('a') ? 'LA' : line.toLowerCase().includes('b') ? 'LB' : 'LD';
      const count = existing.filter(i => i.id.startsWith(`INC-${lineCode}`)).length + 1;
      id = `INC-${lineCode}-${String(count).padStart(3, '0')}`;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const incident = {
      id,
      line,
      machine,
      type,
      severity,
      value,
      threshold,
      status: data.status || 'OPEN',
      state: data.state || 'DETECTED',
      detectedAt: data.detectedAt || timeStr,
      resolvedAt: null,
      downtime: 0,
      rootCause: data.rootCause || null,
      correctiveAction: data.correctiveAction || null,
      groundingSpec: 'ISO 10816-3 (Zone C Alert Limit: 2.8 - 4.5 mm/s)',
      consensusScore: 92
    };

    console.log(`[INFO] Incident ${id} created for ${line} (${machine}) with vibration ${value} mm/s`);
    return db.createIncident(incident);
  }

  updateIncident(id, updates) {
    if (!id) throw new Error('Incident ID is required');
    const existing = db.getIncidentById(id);
    if (!existing) return null;

    const allowedUpdates = {};
    if (updates.status !== undefined) allowedUpdates.status = String(updates.status).toUpperCase();
    if (updates.state !== undefined) allowedUpdates.state = String(updates.state).toUpperCase();
    if (updates.rootCause !== undefined) allowedUpdates.rootCause = String(updates.rootCause);
    if (updates.correctiveAction !== undefined) allowedUpdates.correctiveAction = String(updates.correctiveAction);
    if (updates.resolution !== undefined) allowedUpdates.correctiveAction = String(updates.resolution);
    if (updates.resolvedAt !== undefined) allowedUpdates.resolvedAt = String(updates.resolvedAt);
    if (updates.downtime !== undefined) allowedUpdates.downtime = Number(updates.downtime);
    if (updates.value !== undefined) allowedUpdates.value = Number(updates.value);

    // If resolving without a resolvedAt timestamp, set current time
    if (allowedUpdates.status === 'RESOLVED' && !allowedUpdates.resolvedAt) {
      allowedUpdates.resolvedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (!allowedUpdates.downtime && existing.downtime === 0) {
        allowedUpdates.downtime = 14; // Default realistic simulation downtime
      }
    }

    const result = db.updateIncident(id, allowedUpdates);
    console.log(`[INFO] Incident ${id} updated -> Status: ${result.status}, State: ${result.state}`);
    return result;
  }

  verifyIncident(id) {
    if (!id) throw new Error('Incident ID is required');
    const incident = db.getIncidentById(id);
    if (!incident) return null;

    console.log(`[INFO] POST /api/incidents/${id}/verify - Executing post-maintenance vibration verification`);

    // Simulated 4-stage physics step-down decay curve
    const steps = [
      { step: 1, vibration: 4.2, status: 'CRITICAL', note: 'Baseline anomaly reading before isolation' },
      { step: 2, vibration: 3.6, status: 'WARNING', note: 'Drive dampers aligned & fasteners inspected' },
      { step: 3, vibration: 3.1, status: 'ELEVATED', note: 'Bearing assembly greased & chassis torqued to 85 Nm' },
      { step: 4, vibration: 2.7, status: 'NORMAL', note: 'Post-service 2-minute test run within ISO 10816-3 Zone B' }
    ];

    const finalVibration = 2.7;
    const threshold = incident.threshold || 3.5;
    const verified = finalVibration <= threshold;

    // Update incident in database to reflect verified safe vibration
    db.updateIncident(id, {
      value: finalVibration,
      state: 'VERIFICATION'
    });

    console.log(`[INFO] Verification complete for ${id}: Vibration decayed to ${finalVibration} mm/s (Safe threshold: ${threshold} mm/s). Verified: ${verified}`);

    return {
      incidentId: id,
      status: 'NORMAL',
      verified,
      vibration: finalVibration,
      threshold,
      steps,
      message: 'Vibration successfully verified below operating threshold. Incident ready for sign-off.'
    };
  }
}

module.exports = new IncidentService();
