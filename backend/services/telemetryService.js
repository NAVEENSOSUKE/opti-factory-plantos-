// backend/services/telemetryService.js
// Handles industrial sensor telemetry data stream and anomaly detection

const db = require('../data/database');

const SAFE_VIBRATION_THRESHOLD = 3.5; // mm/s ISO 10816 Zone C alert ceiling

class TelemetryService {
  getLineCTelemetry() {
    const raw = db.getTelemetry('Line C');
    return raw.map(item => ({
      timestamp: item.timestamp,
      vibration: item.vibration,
      status: item.status
    }));
  }

  recordLineCTelemetry(data) {
    if (!data || typeof data.vibration !== 'number') {
      throw new Error('Valid vibration reading (numeric) is required');
    }

    const vibration = parseFloat(data.vibration);
    if (isNaN(vibration) || vibration < 0 || vibration > 100) {
      throw new Error('Vibration must be a positive number within valid physical parameters (0-100 mm/s)');
    }

    const timestamp = data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isAnomaly = vibration > SAFE_VIBRATION_THRESHOLD;
    const status = vibration > 4.0 ? 'CRITICAL' : vibration > 3.5 ? 'WARNING' : vibration > 2.8 ? 'ELEVATED' : 'NORMAL';

    db.addTelemetry('Line C', timestamp, vibration, status);

    if (isAnomaly) {
      console.log(`[WARN] Anomaly detected on Line C telemetry: ${vibration} mm/s exceeds safe threshold (${SAFE_VIBRATION_THRESHOLD} mm/s)`);
    } else {
      console.log(`[INFO] Telemetry point recorded for Line C: ${vibration} mm/s at ${timestamp} (Status: ${status})`);
    }

    return {
      recorded: true,
      line: 'Line C',
      timestamp,
      vibration,
      threshold: SAFE_VIBRATION_THRESHOLD,
      isAnomaly,
      status
    };
  }
}

module.exports = new TelemetryService();
