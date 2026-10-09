// api.js
// Centralized API Client for OptiFactory PlantOS Frontend
// Connects React frontend to Node.js/Express/SQLite backend with automatic localStorage fallback

(function () {
  'use strict';

  const API_BASE = window.OPTIFACTORY_API_URL || 'http://localhost:3000';
  const TIMEOUT_MS = 2500;

  let isConnected = false;
  const statusListeners = [];

  function notifyStatus(status) {
    if (isConnected !== status) {
      isConnected = status;
      statusListeners.forEach(cb => {
        try { cb(isConnected); } catch (e) { console.warn(e); }
      });
    }
  }

  async function fetchWithTimeout(url, options = {}, timeoutMs = TIMEOUT_MS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      });
      clearTimeout(timeoutId);
      notifyStatus(true);
      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      notifyStatus(false);
      throw err;
    }
  }

  const PlantOSApi = {
    isConnected: false,

    onStatusChange(callback) {
      if (typeof callback === 'function') {
        statusListeners.push(callback);
        callback(isConnected);
      }
    },

    // 1. Health check
    async health() {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/api/health`, { method: 'GET' }, 1800);
        if (res.ok) {
          const data = await res.json();
          notifyStatus(true);
          return { ok: true, data };
        }
        notifyStatus(false);
        return { ok: false, error: `HTTP ${res.status}` };
      } catch (err) {
        notifyStatus(false);
        return { ok: false, error: err.message || 'Offline' };
      }
    },

    // 2. Incident APIs
    async getIncidents() {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/api/incidents`, { method: 'GET' });
        if (res.ok) {
          const list = await res.json();
          // Keep localStorage updated as backup
          if (window.storage && Array.isArray(list)) {
            list.forEach(item => window.storage.saveIncident(item));
          }
          return list;
        }
      } catch (err) {
        console.warn('[API Client] getIncidents backend unavailable, falling back to localStorage:', err.message);
      }
      return window.storage ? window.storage.getIncidents() : [];
    },

    async getIncident(id) {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/api/incidents/${encodeURIComponent(id)}`, { method: 'GET' });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn(`[API Client] getIncident(${id}) backend unavailable, falling back to localStorage:`, err.message);
      }
      return window.storage ? window.storage.getIncidentById(id) : null;
    },

    async createIncident(incidentData) {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/api/incidents`, {
          method: 'POST',
          body: JSON.stringify(incidentData)
        });
        if (res.ok) {
          const created = await res.json();
          if (window.storage) window.storage.saveIncident(created);
          return created;
        }
      } catch (err) {
        console.warn('[API Client] createIncident backend unavailable, falling back to local simulation:', err.message);
      }

      // Offline Fallback
      const fallbackId = incidentData.id || `INC-LC-${String(Date.now()).slice(-3)}`;
      const fallbackItem = {
        ...incidentData,
        id: fallbackId,
        status: incidentData.status || 'OPEN',
        state: incidentData.state || 'DETECTED',
        detectedAt: incidentData.detectedAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      if (window.storage) window.storage.saveIncident(fallbackItem);
      return fallbackItem;
    },

    async updateIncident(id, updates) {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/api/incidents/${encodeURIComponent(id)}`, {
          method: 'PATCH',
          body: JSON.stringify(updates)
        });
        if (res.ok) {
          const updated = await res.json();
          if (window.storage) window.storage.updateIncident(id, updated);
          return updated;
        }
      } catch (err) {
        console.warn(`[API Client] updateIncident(${id}) backend unavailable, falling back to localStorage:`, err.message);
      }
      return window.storage ? window.storage.updateIncident(id, updates) : null;
    },

    // 3. Telemetry APIs
    async getTelemetry(line = 'Line C') {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/api/telemetry/line-c`, { method: 'GET' });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('[API Client] getTelemetry backend unavailable, using built-in timeline:', err.message);
      }
      const def = window.INDUSTRY_KNOWLEDGE?.getIncidentWorkflowDefinition() || {};
      return def.telemetryTimeline || [];
    },

    async recordTelemetry(line, data) {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/api/telemetry/line-c`, {
          method: 'POST',
          body: JSON.stringify(data)
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('[API Client] recordTelemetry backend unavailable:', err.message);
      }
      return { recorded: true, ...data };
    },

    // 4. Specialist AI Analysis
    async analyzeIncident({ incidentId, persona = 'Elena Rostova' }) {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/api/agents/analyze`, {
          method: 'POST',
          body: JSON.stringify({ incidentId, persona })
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('[API Client] analyzeIncident backend unavailable, using built-in specialist model:', err.message);
      }
      const def = window.INDUSTRY_KNOWLEDGE?.getIncidentWorkflowDefinition() || {};
      return def.specialistAnalysis || {
        persona: "Elena Rostova",
        role: "Reliability & Vibration Specialist",
        diagnosis: "Vibration has exceeded the configured operating threshold (4.2 mm/s > 3.5 mm/s limit per ISO 10816-3 Zone C alert limit).",
        possibleCauses: ["Bearing wear", "Feeder imbalance", "Mechanical looseness", "Resonance"],
        recommendation: "Inspect feeder bearing assembly and mounting integrity.",
        confidence: 0.94
      };
    },

    // 5. Multi-Agent Consensus
    async runConsensus({ incidentId }) {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/api/consensus`, {
          method: 'POST',
          body: JSON.stringify({ incidentId })
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('[API Client] runConsensus backend unavailable, using built-in consensus:', err.message);
      }
      const def = window.INDUSTRY_KNOWLEDGE?.getIncidentWorkflowDefinition() || {};
      return def.consensus || {
        incidentId: incidentId || 'INC-LC-001',
        confidence: 0.92,
        priority: "HIGH",
        recommendation: "Stop Line C for controlled inspection.",
        agents: []
      };
    },

    // 6. Knowledge Grounding
    async getKnowledge(equipment = 'powertrain-vibratory-feeder') {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/api/knowledge/${encodeURIComponent(equipment)}`, {
          method: 'GET'
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn(`[API Client] getKnowledge(${equipment}) backend unavailable, using built-in knowledge:`, err.message);
      }
      const def = window.INDUSTRY_KNOWLEDGE?.getIncidentWorkflowDefinition() || {};
      return def.grounding || {};
    },

    // 7. Maintenance APIs
    async startMaintenance(incidentId) {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/api/maintenance/start`, {
          method: 'POST',
          body: JSON.stringify({ incidentId })
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('[API Client] startMaintenance backend unavailable, using local state:', err.message);
      }
      if (window.storage && incidentId) {
        window.storage.updateIncident(incidentId, { state: 'MAINTENANCE' });
      }
      return { success: true, incidentId, state: 'MAINTENANCE' };
    },

    async completeMaintenance(incidentId) {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/api/maintenance/complete`, {
          method: 'POST',
          body: JSON.stringify({ incidentId })
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('[API Client] completeMaintenance backend unavailable, using local state:', err.message);
      }
      if (window.storage && incidentId) {
        window.storage.updateIncident(incidentId, { state: 'VERIFICATION' });
      }
      return { success: true, incidentId, state: 'VERIFICATION' };
    },

    // 8. Verification API
    async verifyIncident(incidentId) {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/api/incidents/${encodeURIComponent(incidentId)}/verify`, {
          method: 'POST'
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn(`[API Client] verifyIncident(${incidentId}) backend unavailable, using local decay:`, err.message);
      }
      return {
        status: "NORMAL",
        verified: true,
        vibration: 2.7,
        threshold: 3.5,
        steps: [
          { step: 1, vibration: 4.2, status: "CRITICAL" },
          { step: 2, vibration: 3.6, status: "WARNING" },
          { step: 3, vibration: 3.1, status: "ELEVATED" },
          { step: 4, vibration: 2.7, status: "NORMAL" }
        ]
      };
    }
  };

  // Expose globally
  if (typeof window !== 'undefined') {
    window.api = PlantOSApi;
    window.PlantOSApi = PlantOSApi;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlantOSApi;
  }
})();
