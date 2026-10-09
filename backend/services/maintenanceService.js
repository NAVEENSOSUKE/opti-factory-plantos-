// backend/services/maintenanceService.js
// Industrial Maintenance Workflow Controller

const db = require('../data/database');

class MaintenanceService {
  startMaintenance({ incidentId }) {
    const id = incidentId || 'INC-LC-001';
    console.log(`[INFO] POST /api/maintenance/start - Starting maintenance for ${id}`);

    // Update incident state to MAINTENANCE
    const updated = db.updateIncident(id, {
      state: 'MAINTENANCE'
    });

    // Record in maintenance table
    const record = db.createMaintenanceRecord(
      id,
      1,
      'Execute LOTO & Feeder Bearing Assembly Service',
      'IN_PROGRESS'
    );

    console.log(`[INFO] Maintenance started for ${id} (Incident state: MAINTENANCE)`);

    return {
      success: true,
      incidentId: id,
      state: 'MAINTENANCE',
      status: updated ? updated.status : 'OPEN',
      startedAt: record.startedAt,
      steps: [
        "1. Stop Line C via controlled ramp-down",
        "2. Apply safety isolation / LOTO procedure",
        "3. Inspect feeder bearing assembly",
        "4. Check mechanical mounting & fasteners",
        "5. Verify vibration after maintenance",
        "6. Return Line C to operation if within threshold"
      ]
    };
  }

  completeMaintenance({ incidentId }) {
    const id = incidentId || 'INC-LC-001';
    console.log(`[INFO] POST /api/maintenance/complete - Completing maintenance for ${id}`);

    // Update maintenance table
    const record = db.completeMaintenanceRecord(id);

    // Transition incident state to VERIFICATION
    const updated = db.updateIncident(id, {
      state: 'VERIFICATION'
    });

    console.log(`[INFO] Maintenance completed for ${id}. Incident state advanced to VERIFICATION.`);

    return {
      success: true,
      incidentId: id,
      state: 'VERIFICATION',
      status: updated ? updated.status : 'OPEN',
      completedAt: record.completedAt,
      nextStep: 'Execute vibration verification test run'
    };
  }
}

module.exports = new MaintenanceService();
