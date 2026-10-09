// backend/services/consensusService.js
// Multi-Agent Deliberation and Consensus Synthesis Engine
// Powered by the OptiFactory AI Orchestrator (Groq LLM with Deterministic Fallback)

const aiOrchestrator = require('./aiOrchestrator');

class ConsensusService {
  async runConsensus({ incidentId }) {
    console.log(`[INFO] POST /api/consensus - Starting multi-agent evaluation via AI Orchestrator for incident: "${incidentId || 'INC-LC-001'}"`);
    return await aiOrchestrator.runConsensus({ incidentId });
  }
}

module.exports = new ConsensusService();
