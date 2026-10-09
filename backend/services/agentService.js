// backend/services/agentService.js
// Specialist AI Persona Cognitive Reasoning Service
// Powered by the OptiFactory AI Orchestrator (Groq LLM with Deterministic Physics Fallback)

const aiOrchestrator = require('./aiOrchestrator');

class AgentService {
  async analyzeIncident({ incidentId, persona: personaInput }) {
    console.log(`[INFO] POST /api/agents/analyze - Delegating to AI Orchestrator for incident: "${incidentId || 'INC-LC-001'}", persona: "${personaInput || 'Elena Rostova'}"`);
    return await aiOrchestrator.analyzeSpecialist({ incidentId, persona: personaInput });
  }
}

module.exports = new AgentService();
