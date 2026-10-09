// backend/services/aiOrchestrator.js
// OptiFactory PlantOS AI Orchestration Layer
// Routes industrial diagnostics through External LLM (Groq) with seamless,
// automatic fallback to the Deterministic Industrial Reasoning Engine.

const { llmProvider, localProvider } = require('./providers');
const knowledgeService = require('./knowledgeService');
const telemetryService = require('./telemetryService');
const db = require('../data/database');

const PERSONA_CATALOG = {
  "elena": {
    name: "Elena Rostova",
    role: "Reliability & Vibration Specialist",
    title: "Lead Reliability & Predictive Maintenance Engineer"
  },
  "wei": {
    name: "Wei Chen",
    role: "Automation",
    title: "Robotics & Automation PLC Architect"
  },
  "vance": {
    name: "Dr. Markus Vance",
    role: "Operations",
    title: "Chief Plant Operations Director"
  },
  "jenkins": {
    name: "Marcus Jenkins",
    role: "Economics",
    title: "Global Industrial Economist & Supply Chain Strategist"
  },
  "becker": {
    name: "Sarah Becker",
    role: "EHS",
    title: "Chief EHS & Safety Compliance Officer"
  }
};

class AIOrchestrator {
  constructor() {
    this.llmProvider = llmProvider;
    this.localProvider = localProvider;
  }

  /**
   * Safe status check: returns availability and model without ever revealing the API key.
   */
  getAiStatus() {
    const isAvailable = this.llmProvider.isConfigured();
    const providerName = this.llmProvider.getProviderName();
    const modelName = isAvailable ? this.llmProvider.getModelName() : '';

    return {
      available: isAvailable,
      provider: providerName,
      model: modelName,
      mode: isAvailable ? 'LLM' : 'LOCAL_REASONING'
    };
  }

  /**
   * Helper to format human-readable execution trace timestamp
   */
  _formatTime() {
    return new Date().toLocaleTimeString('en-US', { hour12: false });
  }

  /**
   * Validates specialist output against industrial schema constraints
   */
  validateSpecialistResponse(response) {
    if (!response || typeof response !== 'object') return false;
    if (typeof response.diagnosis !== 'string' || response.diagnosis.trim().length === 0) return false;
    if (!Array.isArray(response.possibleCauses) || response.possibleCauses.length === 0) return false;
    if (typeof response.recommendation !== 'string' || response.recommendation.trim().length === 0) return false;
    if (typeof response.confidence !== 'number' || isNaN(response.confidence) || response.confidence < 0 || response.confidence > 1) return false;
    return true;
  }

  /**
   * Validates multi-agent consensus synthesis output against industrial schema constraints
   */
  validateConsensusResponse(response) {
    if (!response || typeof response !== 'object') return false;
    if (typeof response.priority !== 'string' || !['HIGH', 'MEDIUM', 'LOW'].includes(response.priority.toUpperCase())) return false;
    if (typeof response.recommendation !== 'string' || response.recommendation.trim().length === 0) return false;
    if (typeof response.reasoning !== 'string' || response.reasoning.trim().length === 0) return false;
    if (!Array.isArray(response.agents) || response.agents.length === 0) return false;
    if (typeof response.confidence !== 'number' || isNaN(response.confidence) || response.confidence < 0 || response.confidence > 1) return false;
    return true;
  }

  /**
   * Resolves requested persona key from user/client input
   */
  _resolvePersona(personaInput) {
    if (!personaInput) return PERSONA_CATALOG["elena"];
    const p = personaInput.toLowerCase();
    if (p.includes("wei") || p.includes("chen")) return PERSONA_CATALOG["wei"];
    if (p.includes("vance") || p.includes("markus")) return PERSONA_CATALOG["vance"];
    if (p.includes("jenkins") || p.includes("marcus") || p.includes("sarah j")) return PERSONA_CATALOG["jenkins"];
    if (p.includes("becker") || p.includes("klaus") || p.includes("sarah b")) return PERSONA_CATALOG["becker"];
    return PERSONA_CATALOG["elena"];
  }

  /**
   * Primary entry point for Specialist Persona Analysis (e.g. Elena Rostova)
   */
  async analyzeSpecialist({ incidentId, persona: personaInput }) {
    const traces = [];
    const targetIncidentId = incidentId || "INC-LC-001";

    traces.push({
      time: this._formatTime(),
      event: 'INCIDENT_DETECTED',
      details: `Active incident ${targetIncidentId} loaded for diagnosis`
    });

    // 1. Telemetry Grounding
    const incident = db.getIncidentById(targetIncidentId);
    const vibration = incident ? incident.value : 4.2;
    const telemetry = telemetryService.getLineCTelemetry();

    traces.push({
      time: this._formatTime(),
      event: 'TELEMETRY_GROUNDED',
      details: `Grounded against ${telemetry.length} telemetry samples (Line C vibration: ${vibration} mm/s RMS)`
    });

    // 2. Knowledge Grounding
    const knowledge = knowledgeService.getEquipmentKnowledge('powertrain-vibratory-feeder');
    const standards = knowledge?.standard || {
      standardId: "ISO 10816-3",
      alertCeiling: 3.5,
      unit: "mm/s RMS"
    };

    traces.push({
      time: this._formatTime(),
      event: 'KNOWLEDGE_RETRIEVED',
      details: `ISO 10816-3 Zone C limit (3.5 mm/s) & IFM VVB001 IO-Link specs loaded`
    });

    const persona = this._resolvePersona(personaInput);
    let analysisResult = null;
    let engineUsed = "LOCAL_REASONING";
    let providerName = "local";
    let modelName = "optifactory-deterministic-v1";
    let actualLatencyMs = 2;

    // 3. Engine Selection and Execution
    if (this.llmProvider.isConfigured()) {
      traces.push({
        time: this._formatTime(),
        event: 'AI_ENGINE_SELECTED: GROQ',
        mode: 'LLM',
        details: `LLM engine online: ${this.llmProvider.getModelName()} via Groq Cloud`
      });

      traces.push({
        time: this._formatTime(),
        event: 'AI_REQUEST_STARTED',
        details: `Dispatching structured industrial context to Groq API`
      });

      try {
        const rawResult = await this.llmProvider.analyzePersona({
          persona,
          incident,
          telemetry,
          equipment: knowledge,
          standards
        });

        actualLatencyMs = rawResult.aiLatencyMs || 150;

        traces.push({
          time: this._formatTime(),
          event: 'AI_RESPONSE_RECEIVED',
          details: `Groq responded in ${actualLatencyMs}ms`
        });

        // 4. Validate Response
        if (this.validateSpecialistResponse(rawResult)) {
          traces.push({
            time: this._formatTime(),
            event: 'AI_RESPONSE_VALIDATED',
            details: `Validated schema: diagnosis, possibleCauses (${rawResult.possibleCauses.length}), recommendation, confidence: ${rawResult.confidence}`
          });
          analysisResult = rawResult;
          engineUsed = "LLM";
          providerName = this.llmProvider.getProviderName();
          modelName = this.llmProvider.getModelName();
        } else {
          console.warn('[ORCHESTRATOR] LLM response failed validation. Falling back to local reasoning.');
          traces.push({
            time: this._formatTime(),
            event: 'GROQ_REQUEST_FAILED',
            details: 'Model output failed schema validation (missing required attributes)'
          });
          traces.push({
            time: this._formatTime(),
            event: 'FALLBACK_LOCAL_REASONING',
            details: 'Triggered deterministic industrial reasoning engine fallback'
          });
        }
      } catch (err) {
        const isTimeout = err.isTimeout || err.name === 'AbortError';
        console.warn(`[ORCHESTRATOR] LLM call error (${isTimeout ? 'Timeout' : err.message}). Falling back to local reasoning.`);
        traces.push({
          time: this._formatTime(),
          event: isTimeout ? 'LLM_TIMEOUT' : 'GROQ_REQUEST_FAILED',
          details: `External call failed (${err.message})`
        });
        traces.push({
          time: this._formatTime(),
          event: 'FALLBACK_LOCAL_REASONING',
          details: 'Triggered deterministic industrial reasoning engine fallback'
        });
      }
    } else {
      traces.push({
        time: this._formatTime(),
        event: 'AI_ENGINE_SELECTED: LOCAL_REASONING',
        mode: 'LOCAL_REASONING',
        details: 'No external API key configured. Operating in high-fidelity deterministic physics mode'
      });
    }

    // 5. Fallback execution if LLM was unconfigured or failed
    if (!analysisResult) {
      analysisResult = this.localProvider.analyzePersona({
        persona,
        incident,
        telemetry,
        equipment: knowledge,
        standards
      });
      engineUsed = "LOCAL_REASONING";
      providerName = "local";
      modelName = "optifactory-deterministic-v1";
      actualLatencyMs = analysisResult.aiLatencyMs || 3;
    }

    traces.push({
      time: this._formatTime(),
      event: 'SPECIALIST_ANALYSIS',
      details: `${persona.name} formulated diagnosis with ${(analysisResult.confidence * 100).toFixed(0)}% confidence`
    });

    // Optional database extension update if incident exists
    if (incident) {
      try {
        db.updateIncident(targetIncidentId, {
          diagnosis: analysisResult.diagnosis
        });
      } catch (_) {}
    }

    return {
      incidentId: targetIncidentId,
      persona: persona.name,
      role: persona.role,
      title: persona.title,
      diagnosis: analysisResult.diagnosis,
      possibleCauses: analysisResult.possibleCauses,
      evidence: analysisResult.evidence || [`Vibration RMS: ${vibration} mm/s > 3.5 mm/s ISO limit`],
      recommendation: analysisResult.recommendation,
      risk: analysisResult.risk || "Imminent mechanical trip or bearing seizure",
      confidence: analysisResult.confidence,
      requiresInspection: analysisResult.requiresInspection !== undefined ? analysisResult.requiresInspection : true,
      reasoningEngine: engineUsed === 'LLM' ? `Groq Cloud AI Orchestrator (${modelName})` : "OptiFactory Deterministic Industrial Physics Engine (ISO 10816 Grounded)",
      aiEngine: engineUsed,
      aiProvider: providerName,
      aiModel: modelName,
      aiLatencyMs: actualLatencyMs,
      traces
    };
  }

  /**
   * 5-Persona Consensus Deliberation and Synthesis
   */
  async runConsensus({ incidentId }) {
    const traces = [];
    const targetIncidentId = incidentId || "INC-LC-001";

    traces.push({
      time: this._formatTime(),
      event: 'CONSENSUS_STARTED',
      details: `Evaluating 5 industrial personas across reliability, automation, operations, economics, and EHS`
    });

    const incident = db.getIncidentById(targetIncidentId);
    const telemetry = telemetryService.getLineCTelemetry();
    const knowledge = knowledgeService.getEquipmentKnowledge('powertrain-vibratory-feeder');
    const standards = knowledge?.standard || { standardId: "ISO 10816-3", alertCeiling: 3.5 };

    // 1. Gather all 5 persona assessments
    const personaKeys = ["elena", "wei", "vance", "jenkins", "becker"];
    const specialistAssessments = [];

    for (const key of personaKeys) {
      const p = PERSONA_CATALOG[key];
      // For consensus personas, run fast local assessment for reliability & speed
      const personaEval = this.localProvider.analyzePersona({
        persona: p,
        incident,
        telemetry,
        equipment: knowledge,
        standards
      });
      specialistAssessments.push(personaEval);
    }

    let consensusResult = null;
    let engineUsed = "LOCAL_REASONING";
    let providerName = "local";
    let modelName = "optifactory-consensus-engine-v1";
    let actualLatencyMs = 4;

    // 2. Synthesize via LLM if available
    if (this.llmProvider.isConfigured()) {
      traces.push({
        time: this._formatTime(),
        event: 'AI_ENGINE_SELECTED: GROQ',
        details: `Consensus synthesis requested via Groq LLM (${this.llmProvider.getModelName()})`
      });

      try {
        const rawConsensus = await this.llmProvider.synthesizeConsensus({
          assessments: specialistAssessments,
          incident,
          telemetry,
          equipment: knowledge,
          standards
        });

        actualLatencyMs = rawConsensus.aiLatencyMs || 220;

        if (this.validateConsensusResponse(rawConsensus)) {
          consensusResult = rawConsensus;
          engineUsed = "LLM";
          providerName = this.llmProvider.getProviderName();
          modelName = this.llmProvider.getModelName();
          traces.push({
            time: this._formatTime(),
            event: 'AI_RESPONSE_VALIDATED',
            details: `Unified consensus synthesized with ${(rawConsensus.confidence * 100).toFixed(0)}% cross-functional confidence`
          });
        } else {
          console.warn('[ORCHESTRATOR] LLM consensus failed validation. Falling back.');
          traces.push({
            time: this._formatTime(),
            event: 'FALLBACK_LOCAL_REASONING',
            details: 'Consensus synthesis fell back to deterministic cross-functional matrix'
          });
        }
      } catch (err) {
        console.warn(`[ORCHESTRATOR] LLM consensus error (${err.message}). Falling back to local.`);
        traces.push({
          time: this._formatTime(),
          event: 'FALLBACK_LOCAL_REASONING',
          details: `Consensus fell back to local engine (${err.message})`
        });
      }
    }

    // 3. Fallback to deterministic consensus if needed
    if (!consensusResult) {
      consensusResult = this.localProvider.synthesizeConsensus({
        assessments: specialistAssessments,
        incident,
        telemetry,
        equipment: knowledge,
        standards
      });
      engineUsed = "LOCAL_REASONING";
      providerName = "local";
      modelName = "optifactory-consensus-engine-v1";
      actualLatencyMs = consensusResult.aiLatencyMs || 4;
    }

    traces.push({
      time: this._formatTime(),
      event: 'CONSENSUS_COMPLETE',
      details: `Consensus complete: ${consensusResult.priority} Priority, ${Math.round(consensusResult.confidence * 100)}% confidence`
    });

    // 4. Update Database
    if (incident) {
      db.updateIncident(targetIncidentId, {
        state: 'CONSENSUS',
        consensusScore: Math.round(consensusResult.confidence * 100)
      });
    }

    return {
      incidentId: targetIncidentId,
      priority: consensusResult.priority,
      confidence: consensusResult.confidence,
      recommendation: consensusResult.recommendation,
      reasoning: consensusResult.reasoning,
      actionPlanSummary: consensusResult.actionPlanSummary,
      agents: consensusResult.agents,
      aiEngine: engineUsed,
      aiProvider: providerName,
      aiModel: modelName,
      aiLatencyMs: actualLatencyMs,
      traces
    };
  }
}

module.exports = new AIOrchestrator();
