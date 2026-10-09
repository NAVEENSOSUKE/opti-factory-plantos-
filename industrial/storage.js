// storage.js - OptiFactory PlantOS & SportPulse AI Persistent Storage Utility
// Safe, fault-tolerant localStorage manager for incidents, scraper cache, and game stats

(function () {
  'use strict';

  const STORAGE_KEYS = {
    INCIDENTS: 'plantos_incident_history_v1',
    ACTIVE_INCIDENT: 'plantos_active_incident_v1',
    SCRAPES: 'plantos_custom_scrapes_v1',
    QUIZ_HIGHSCORE: 'sportpulse_quiz_highscore_v1',
    SAVED_INSIGHTS: 'sportpulse_saved_insights_v1',
    THEME: 'sportpulse_theme'
  };

  // Seed default incident history so empty state is realistic and instantly demonstrable
  const DEFAULT_INCIDENTS = [
    {
      id: "INC-LC-001",
      line: "Line C",
      lineId: "line_c",
      machine: "Powertrain & Vibratory Feeder #2",
      type: "Vibration Anomaly",
      severity: "HIGH",
      value: 4.2,
      unit: "mm/s",
      threshold: 3.5,
      peakValue: 4.2,
      trend: "+37%",
      status: "RESOLVED",
      state: "RESOLVED",
      detectedAt: "10:24 AM",
      resolvedAt: "10:38 AM",
      downtimeMinutes: 14,
      rootCause: "Feeder drive harmonic resonance & bearing raceway fatigue",
      resolution: "Bearing assembly inspected, mounting fasteners re-torqued to 85 Nm, resonant frequency re-tuned to 50.2 Hz",
      groundingSpec: "ISO 10816-3 (Zone C Alert Limit: 2.8 - 4.5 mm/s)",
      consensusScore: 92
    },
    {
      id: "INC-LA-004",
      line: "Line A",
      lineId: "line_a",
      machine: "1200T Hydraulic Blanking Press",
      type: "Pressure Excursion",
      severity: "MEDIUM",
      value: 182,
      unit: "bar",
      threshold: 175,
      peakValue: 184,
      trend: "+8%",
      status: "RESOLVED",
      state: "RESOLVED",
      detectedAt: "08:42 AM",
      resolvedAt: "08:56 AM",
      downtimeMinutes: 14,
      rootCause: "Proportional relief valve PV-1 spool micro-sticking",
      resolution: "Valve spool flushed with hydraulic fluid, return line filter serviced",
      groundingSpec: "DIN 24342 Cartridge Valve Operational Limits",
      consensusScore: 89
    },
    {
      id: "INC-LB-002",
      line: "Line B",
      lineId: "line_b",
      machine: "KUKA Laser Seam Joining Station",
      type: "Gas Flow Variance",
      severity: "LOW",
      value: 16.4,
      unit: "L/min",
      threshold: 18.0,
      peakValue: 16.2,
      trend: "-12%",
      status: "RESOLVED",
      state: "RESOLVED",
      detectedAt: "07:15 AM",
      resolvedAt: "07:26 AM",
      downtimeMinutes: 11,
      rootCause: "Argon gas manifold solenoid regulator lag",
      resolution: "Manifold pressure regulator purged and setpoint calibrated to 20 L/min",
      groundingSpec: "AWS C7.2M Laser Welding Shielding Standards",
      consensusScore: 95
    }
  ];

  function safeGet(key, fallback) {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return fallback;
      const raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (err) {
      console.warn(`[PlantOSStorage] Failed to read "${key}" from localStorage:`, err);
      return fallback;
    }
  }

  function safeSet(key, value) {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.warn(`[PlantOSStorage] Failed to write "${key}" to localStorage:`, err);
      return false;
    }
  }

  const PlantOSStorage = {
    // --- INCIDENT STORAGE ---
    getIncidents() {
      const items = safeGet(STORAGE_KEYS.INCIDENTS, null);
      if (!items || !Array.isArray(items) || items.length === 0) {
        // Initialize default seed
        safeSet(STORAGE_KEYS.INCIDENTS, DEFAULT_INCIDENTS);
        return [...DEFAULT_INCIDENTS];
      }
      return items;
    },

    saveIncident(incident) {
      if (!incident || !incident.id) return false;
      const list = this.getIncidents();
      const existingIdx = list.findIndex(item => item.id === incident.id);
      if (existingIdx >= 0) {
        list[existingIdx] = { ...list[existingIdx], ...incident };
      } else {
        list.unshift(incident);
      }
      return safeSet(STORAGE_KEYS.INCIDENTS, list);
    },

    getIncidentById(id) {
      if (!id) return null;
      const list = this.getIncidents();
      return list.find(item => item.id === id) || null;
    },

    updateIncident(id, updates) {
      if (!id || !updates) return false;
      const list = this.getIncidents();
      const idx = list.findIndex(item => item.id === id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...updates };
        safeSet(STORAGE_KEYS.INCIDENTS, list);
        return list[idx];
      }
      return null;
    },

    clearIncidents() {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(STORAGE_KEYS.INCIDENTS);
        }
        return safeSet(STORAGE_KEYS.INCIDENTS, DEFAULT_INCIDENTS);
      } catch (err) {
        console.warn('[PlantOSStorage] Error clearing incidents:', err);
        return false;
      }
    },

    // Active in-progress incident snapshot
    getActiveIncident() {
      return safeGet(STORAGE_KEYS.ACTIVE_INCIDENT, null);
    },

    saveActiveIncident(incident) {
      return safeSet(STORAGE_KEYS.ACTIVE_INCIDENT, incident);
    },

    clearActiveIncident() {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(STORAGE_KEYS.ACTIVE_INCIDENT);
        }
        return true;
      } catch (e) {
        return false;
      }
    },

    // --- SCRAPER CUSTOM SPECIFICATIONS ---
    getScrapedFeatures() {
      return safeGet(STORAGE_KEYS.SCRAPES, []);
    },

    saveScrapedFeature(feature) {
      if (!feature || !feature.name) return false;
      const list = this.getScrapedFeatures();
      list.unshift(feature);
      return safeSet(STORAGE_KEYS.SCRAPES, list);
    },

    // --- SPORTPULSE QUIZ & APP PERSISTENCE ---
    getQuizHighScore() {
      const val = safeGet(STORAGE_KEYS.QUIZ_HIGHSCORE, 0);
      return typeof val === 'number' ? val : 0;
    },

    saveQuizHighScore(score) {
      const current = this.getQuizHighScore();
      if (score > current) {
        safeSet(STORAGE_KEYS.QUIZ_HIGHSCORE, score);
        return true; // New high score
      }
      return false;
    },

    getSavedInsights() {
      return safeGet(STORAGE_KEYS.SAVED_INSIGHTS, []);
    },

    saveInsight(insight) {
      const list = this.getSavedInsights();
      list.unshift(insight);
      return safeSet(STORAGE_KEYS.SAVED_INSIGHTS, list);
    }
  };

  // Expose both namespaces for maximum convenience and compatibility
  if (typeof window !== 'undefined') {
    window.storage = PlantOSStorage;
    window.PlantOSStorage = PlantOSStorage;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlantOSStorage;
  }
})();
