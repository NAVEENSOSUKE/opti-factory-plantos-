// backend/data/database.js
// SQLite database engine for OptiFactory PlantOS
// Utilizes Node.js native SQLite (DatabaseSync) with persistent file storage and seed telemetry

const path = require('path');
const fs = require('fs');

const DB_FILE = path.join(__dirname, 'optifactory.sqlite');

let db = null;
let isNativeSqlite = false;

// 1. Initialize SQLite Database
try {
  const { DatabaseSync } = require('node:sqlite');
  db = new DatabaseSync(DB_FILE);
  isNativeSqlite = true;
  console.log(`[DATABASE] SQLite engine initialized using native DatabaseSync (${DB_FILE})`);
} catch (err) {
  console.warn('[DATABASE] Native node:sqlite not available, falling back to JSON-backed storage:', err.message);
}

// Fallback in-memory/JSON store in case native SQLite is unavailable
class JsonFallbackDB {
  constructor(filePath) {
    this.filePath = filePath.replace('.sqlite', '.json');
    this.data = { incidents: [], telemetry: [], maintenance: [] };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        this.data = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
      }
    } catch (e) {
      console.warn('[DATABASE] Failed to load JSON fallback:', e);
    }
  }

  save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e) {
      console.warn('[DATABASE] Failed to save JSON fallback:', e);
    }
  }

  exec() {}
}

const fallbackDb = !isNativeSqlite ? new JsonFallbackDB(DB_FILE) : null;

// 2. Initialize Tables Schema
function initSchema() {
  if (isNativeSqlite) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS incidents (
        id TEXT PRIMARY KEY,
        line TEXT NOT NULL,
        machine TEXT,
        type TEXT,
        severity TEXT,
        value REAL,
        threshold REAL,
        status TEXT DEFAULT 'OPEN',
        state TEXT DEFAULT 'DETECTED',
        detectedAt TEXT,
        resolvedAt TEXT,
        downtime REAL DEFAULT 0,
        rootCause TEXT,
        correctiveAction TEXT,
        groundingSpec TEXT,
        consensusScore REAL
      );

      CREATE TABLE IF NOT EXISTS telemetry (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        line TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        vibration REAL NOT NULL,
        status TEXT
      );

      CREATE TABLE IF NOT EXISTS maintenance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        incidentId TEXT NOT NULL,
        step INTEGER,
        stepName TEXT,
        status TEXT,
        startedAt TEXT,
        completedAt TEXT
      );
    `);
  }

  seedInitialData();
}

// 3. Seed Initial Realistic Industrial Data if Empty
function seedInitialData() {
  const initialIncidents = [
    {
      id: "INC-LC-001",
      line: "Line C",
      machine: "Powertrain & Vibratory Feeder #2",
      type: "Vibration Anomaly",
      severity: "HIGH",
      value: 4.2,
      threshold: 3.5,
      status: "RESOLVED",
      state: "RESOLVED",
      detectedAt: "10:24 AM",
      resolvedAt: "10:38 AM",
      downtime: 14,
      rootCause: "Feeder drive harmonic resonance & bearing raceway fatigue",
      correctiveAction: "Bearing assembly inspected, mounting fasteners re-torqued to 85 Nm, resonant frequency tuned to 50.2 Hz",
      groundingSpec: "ISO 10816-3 (Zone C Alert Limit: 2.8 - 4.5 mm/s)",
      consensusScore: 92
    },
    {
      id: "INC-LA-004",
      line: "Line A",
      machine: "1200T Hydraulic Blanking Press",
      type: "Pressure Excursion",
      severity: "MEDIUM",
      value: 182,
      threshold: 175,
      status: "RESOLVED",
      state: "RESOLVED",
      detectedAt: "08:42 AM",
      resolvedAt: "08:56 AM",
      downtime: 14,
      rootCause: "Proportional relief valve PV-1 spool micro-sticking",
      correctiveAction: "Valve spool flushed with hydraulic fluid, return line filter serviced",
      groundingSpec: "DIN 24342 Cartridge Valve Operational Limits",
      consensusScore: 89
    },
    {
      id: "INC-LB-002",
      line: "Line B",
      machine: "KUKA Laser Seam Joining Station",
      type: "Gas Flow Variance",
      severity: "LOW",
      value: 16.4,
      threshold: 18.0,
      status: "RESOLVED",
      state: "RESOLVED",
      detectedAt: "07:15 AM",
      resolvedAt: "07:26 AM",
      downtime: 11,
      rootCause: "Argon gas manifold solenoid regulator lag",
      correctiveAction: "Manifold pressure regulator purged and setpoint calibrated to 20 L/min",
      groundingSpec: "AWS C7.2M Laser Welding Shielding Standards",
      consensusScore: 95
    }
  ];

  const initialTelemetryLineC = [
    { timestamp: "09:40", vibration: 2.1, status: "NORMAL" },
    { timestamp: "09:41", vibration: 2.3, status: "NORMAL" },
    { timestamp: "09:42", vibration: 2.7, status: "NORMAL" },
    { timestamp: "09:43", vibration: 3.1, status: "ELEVATED" },
    { timestamp: "09:44", vibration: 3.8, status: "WARNING" },
    { timestamp: "09:45", vibration: 4.2, status: "CRITICAL" }
  ];

  if (isNativeSqlite) {
    const countStmt = db.prepare('SELECT COUNT(*) as count FROM incidents');
    const row = countStmt.get();
    if (!row || row.count === 0) {
      console.log('[DATABASE] Seeding initial incidents into SQLite...');
      const insertInc = db.prepare(`
        INSERT INTO incidents (id, line, machine, type, severity, value, threshold, status, state, detectedAt, resolvedAt, downtime, rootCause, correctiveAction, groundingSpec, consensusScore)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const inc of initialIncidents) {
        insertInc.run(
          inc.id, inc.line, inc.machine, inc.type, inc.severity,
          inc.value, inc.threshold, inc.status, inc.state, inc.detectedAt,
          inc.resolvedAt, inc.downtime, inc.rootCause, inc.correctiveAction,
          inc.groundingSpec, inc.consensusScore
        );
      }
    }

    const telCountStmt = db.prepare('SELECT COUNT(*) as count FROM telemetry WHERE line = ?');
    const telRow = telCountStmt.get('Line C');
    if (!telRow || telRow.count === 0) {
      console.log('[DATABASE] Seeding Line C telemetry timeline into SQLite...');
      const insertTel = db.prepare(`
        INSERT INTO telemetry (line, timestamp, vibration, status)
        VALUES (?, ?, ?, ?)
      `);
      for (const tel of initialTelemetryLineC) {
        insertTel.run('Line C', tel.timestamp, tel.vibration, tel.status);
      }
    }
  } else {
    if (fallbackDb.data.incidents.length === 0) {
      fallbackDb.data.incidents = initialIncidents;
      fallbackDb.data.telemetry = initialTelemetryLineC.map((t, idx) => ({ id: idx + 1, line: 'Line C', ...t }));
      fallbackDb.save();
    }
  }
}

// Initialize on load
initSchema();

// 4. Incident Database Operations
function getIncidents() {
  if (isNativeSqlite) {
    const stmt = db.prepare('SELECT * FROM incidents ORDER BY detectedAt DESC');
    return stmt.all();
  }
  return [...fallbackDb.data.incidents];
}

function getIncidentById(id) {
  if (!id) return null;
  if (isNativeSqlite) {
    const stmt = db.prepare('SELECT * FROM incidents WHERE id = ?');
    return stmt.get(id) || null;
  }
  return fallbackDb.data.incidents.find(i => i.id === id) || null;
}

function createIncident(inc) {
  if (!inc || !inc.id) throw new Error('Incident ID is required');
  const defaults = {
    machine: 'Powertrain & Vibratory Feeder #2',
    type: 'Vibration Anomaly',
    severity: 'HIGH',
    value: 4.2,
    threshold: 3.5,
    status: 'OPEN',
    state: 'DETECTED',
    detectedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    resolvedAt: null,
    downtime: 0,
    rootCause: null,
    correctiveAction: null,
    groundingSpec: 'ISO 10816-3 (Zone C Alert Limit: 2.8 - 4.5 mm/s)',
    consensusScore: 92
  };

  const item = { ...defaults, ...inc };

  if (isNativeSqlite) {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO incidents (id, line, machine, type, severity, value, threshold, status, state, detectedAt, resolvedAt, downtime, rootCause, correctiveAction, groundingSpec, consensusScore)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      item.id, item.line, item.machine, item.type, item.severity,
      item.value, item.threshold, item.status, item.state, item.detectedAt,
      item.resolvedAt, item.downtime, item.rootCause, item.correctiveAction,
      item.groundingSpec, item.consensusScore
    );
    return getIncidentById(item.id);
  } else {
    const idx = fallbackDb.data.incidents.findIndex(i => i.id === item.id);
    if (idx >= 0) fallbackDb.data.incidents[idx] = item;
    else fallbackDb.data.incidents.unshift(item);
    fallbackDb.save();
    return item;
  }
}

function updateIncident(id, updates) {
  if (!id || !updates) return null;
  const current = getIncidentById(id);
  if (!current) return null;

  const merged = { ...current, ...updates };

  if (isNativeSqlite) {
    const stmt = db.prepare(`
      UPDATE incidents
      SET line = ?, machine = ?, type = ?, severity = ?, value = ?, threshold = ?,
          status = ?, state = ?, detectedAt = ?, resolvedAt = ?, downtime = ?,
          rootCause = ?, correctiveAction = ?, groundingSpec = ?, consensusScore = ?
      WHERE id = ?
    `);
    stmt.run(
      merged.line, merged.machine, merged.type, merged.severity, merged.value, merged.threshold,
      merged.status, merged.state, merged.detectedAt, merged.resolvedAt, merged.downtime,
      merged.rootCause, merged.correctiveAction, merged.groundingSpec, merged.consensusScore,
      id
    );
    return getIncidentById(id);
  } else {
    const idx = fallbackDb.data.incidents.findIndex(i => i.id === id);
    if (idx >= 0) {
      fallbackDb.data.incidents[idx] = merged;
      fallbackDb.save();
      return merged;
    }
    return null;
  }
}

// 5. Telemetry Database Operations
function getTelemetry(lineName = 'Line C') {
  if (isNativeSqlite) {
    const stmt = db.prepare('SELECT timestamp, vibration, status FROM telemetry WHERE line = ? ORDER BY id ASC');
    return stmt.all(lineName);
  }
  return fallbackDb.data.telemetry
    .filter(t => t.line.toLowerCase() === lineName.toLowerCase())
    .map(({ timestamp, vibration, status }) => ({ timestamp, vibration, status }));
}

function addTelemetry(line, timestamp, vibration, status = 'NORMAL') {
  if (isNativeSqlite) {
    const stmt = db.prepare('INSERT INTO telemetry (line, timestamp, vibration, status) VALUES (?, ?, ?, ?)');
    stmt.run(line, timestamp, vibration, status);
  } else {
    fallbackDb.data.telemetry.push({
      id: fallbackDb.data.telemetry.length + 1,
      line,
      timestamp,
      vibration,
      status
    });
    fallbackDb.save();
  }
}

// 6. Maintenance Operations
function createMaintenanceRecord(incidentId, step = 1, stepName = 'Stop Line C & Lockout-Tagout', status = 'IN_PROGRESS') {
  const startedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  if (isNativeSqlite) {
    const stmt = db.prepare('INSERT INTO maintenance (incidentId, step, stepName, status, startedAt) VALUES (?, ?, ?, ?, ?)');
    stmt.run(incidentId, step, stepName, status, startedAt);
  } else {
    fallbackDb.data.maintenance.push({
      id: fallbackDb.data.maintenance.length + 1,
      incidentId,
      step,
      stepName,
      status,
      startedAt,
      completedAt: null
    });
    fallbackDb.save();
  }
  return { incidentId, step, stepName, status, startedAt };
}

function completeMaintenanceRecord(incidentId) {
  const completedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  if (isNativeSqlite) {
    const stmt = db.prepare("UPDATE maintenance SET status = 'COMPLETED', completedAt = ? WHERE incidentId = ? AND status = 'IN_PROGRESS'");
    stmt.run(completedAt, incidentId);
  } else {
    const rec = fallbackDb.data.maintenance.find(m => m.incidentId === incidentId && m.status === 'IN_PROGRESS');
    if (rec) {
      rec.status = 'COMPLETED';
      rec.completedAt = completedAt;
      fallbackDb.save();
    }
  }
  return { incidentId, status: 'COMPLETED', completedAt };
}

module.exports = {
  getIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  getTelemetry,
  addTelemetry,
  createMaintenanceRecord,
  completeMaintenanceRecord
};
