// backend/services/providers/llmProvider.js
// Groq / OpenAI-compatible external LLM provider for OptiFactory PlantOS
// Implements secure, privacy-preserving structured industrial reasoning

class LLMProvider {
  constructor() {
    this.name = 'groq';
    this.mode = 'LLM';
    this.defaultTimeoutMs = 8000;
  }

  isConfigured() {
    const key = process.env.AI_API_KEY;
    return typeof key === 'string' && key.trim().length > 0 && !key.startsWith('your_') && !key.includes('placeholder');
  }

  getProviderName() {
    return (process.env.AI_PROVIDER || 'groq').toLowerCase();
  }

  getModelName() {
    return process.env.AI_MODEL || 'openai/gpt-oss-120b';
  }

  getBaseUrl() {
    const base = process.env.AI_BASE_URL || 'https://api.groq.com/openai/v1';
    return base.replace(/\/+$/, '');
  }

  async _sendChatCompletion(messages, timeoutMs = this.defaultTimeoutMs) {
    if (!this.isConfigured()) {
      throw new Error('LLM Provider is not configured (missing AI_API_KEY)');
    }

    const apiKey = process.env.AI_API_KEY.trim();
    const model = this.getModelName();
    const endpoint = `${this.getBaseUrl()}/chat/completions`;

    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    const payload = {
      model,
      messages,
      temperature: 0.2, // Low temperature for factual industrial consistency
      response_format: { type: 'json_object' }
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timer);

      if (!response.ok) {
        let errDetails = '';
        try {
          const errJson = await response.json();
          errDetails = errJson.error?.message || JSON.stringify(errJson);
        } catch (_) {
          errDetails = await response.text();
        }
        const error = new Error(`LLM provider HTTP ${response.status}: ${errDetails}`);
        error.statusCode = response.status;
        throw error;
      }

      const data = await response.json();
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Malformed completion response structure from LLM provider');
      }

      const content = data.choices[0].message.content;
      return JSON.parse(content);
    } catch (err) {
      clearTimeout(timer);
      if (err.name === 'AbortError') {
        const timeoutError = new Error(`LLM request timed out after ${timeoutMs}ms`);
        timeoutError.isTimeout = true;
        throw timeoutError;
      }
      throw err;
    }
  }

  async analyzePersona({ persona, incident, telemetry, equipment, standards, timeoutMs }) {
    const startTime = Date.now();

    const systemPrompt = `You are a certified industrial reliability AI assistant operating inside the OptiFactory PlantOS AI Orchestrator.
You must adopt the persona of: ${persona.name} (${persona.role}).
Follow these strict industrial reasoning constraints:
1. Ground your analysis strictly in the provided industrial telemetry, ISO 10816-3 standards, and equipment specifications.
2. Do NOT invent sensor readings, historical values, or equipment specifications not present in the context.
3. Clearly distinguish observed telemetry from engineering inference.
4. Recommend safe, compliant operational procedures (e.g., LOTO, controlled ramp-down, torque re-checks). Do not bypass safety procedures.
5. Do NOT claim that physical inspection or manual servicing was already performed; indicate whether inspection is required.
6. Return STRICTLY valid JSON conforming to this exact schema:
{
  "diagnosis": "string: concise engineering diagnosis of the physical root anomaly",
  "possibleCauses": ["string: root cause 1", "string: root cause 2"],
  "evidence": ["string: observed sensor reading or standard threshold"],
  "recommendation": "string: clear, actionable maintenance or operational recommendation",
  "risk": "string: physical, operational, or safety risk if left unaddressed",
  "confidence": 0.0 to 1.0 (float reflecting certainty based on telemetry evidence),
  "requiresInspection": true or false
}`;

    // Cleaned, privacy-preserving industrial context (no paths, no keys, no user info)
    const contextPayload = {
      incident: incident ? {
        id: incident.id || "INC-LC-001",
        line: incident.line || "Line C",
        machine: incident.machine || "Powertrain & Vibratory Feeder #2",
        vibration: incident.value !== undefined ? incident.value : 4.2,
        threshold: incident.threshold !== undefined ? incident.threshold : 3.5,
        severity: incident.severity || "HIGH",
        status: incident.status || "OPEN"
      } : null,
      telemetry: Array.isArray(telemetry) ? telemetry.slice(-10) : [],
      equipment: equipment ? {
        name: equipment.equipment || "Powertrain & Vibratory Feeder #2",
        line: equipment.line || "Line C",
        sensor: equipment.sensor ? {
          model: equipment.sensor.model,
          measuringRange: equipment.sensor.measuringRange,
          frequencyRange: equipment.sensor.frequencyRange
        } : null
      } : null,
      standards: standards || {
        standardId: "ISO 10816-3",
        alertCeiling: 3.5,
        unit: "mm/s RMS",
        category: "Industrial vibration limits on rigid foundations"
      },
      persona: {
        name: persona.name,
        role: persona.role
      }
    };

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: JSON.stringify(contextPayload, null, 2) }
    ];

    const parsedJson = await this._sendChatCompletion(messages, timeoutMs);
    const latencyMs = Math.max(1, Date.now() - startTime);

    return {
      persona: persona.name,
      role: persona.role,
      diagnosis: parsedJson.diagnosis,
      possibleCauses: Array.isArray(parsedJson.possibleCauses) ? parsedJson.possibleCauses : [parsedJson.possibleCauses].filter(Boolean),
      evidence: Array.isArray(parsedJson.evidence) ? parsedJson.evidence : [],
      recommendation: parsedJson.recommendation,
      risk: parsedJson.risk || "Elevated mechanical wear",
      confidence: typeof parsedJson.confidence === 'number' ? Math.min(1.0, Math.max(0.0, parsedJson.confidence)) : 0.90,
      requiresInspection: parsedJson.requiresInspection !== undefined ? Boolean(parsedJson.requiresInspection) : true,
      aiEngine: "LLM",
      aiProvider: this.getProviderName(),
      aiModel: this.getModelName(),
      aiLatencyMs: latencyMs
    };
  }

  async synthesizeConsensus({ assessments, incident, telemetry, equipment, standards, timeoutMs }) {
    const startTime = Date.now();

    const systemPrompt = `You are the OptiFactory Chief Cross-Functional Consensus Synthesis Engine.
You receive assessments from 5 industrial specialists:
- Elena Rostova (Reliability & Vibration Specialist)
- Wei Chen (Automation & PLC Architect)
- Dr. Markus Vance (Operations Director)
- Marcus Jenkins (Industrial Economics)
- Sarah Becker (EHS & Safety Compliance)

Synthesize their findings into an authoritative, unified consensus.
Guidelines:
1. Do not invent details not present in the specialist assessments or equipment telemetry.
2. Consider vibration severity, takt deviation, safety isolation (LOTO), and economic scrap prevention.
3. Weigh reliability and safety heavily.
4. Return STRICTLY valid JSON conforming to this schema:
{
  "priority": "HIGH" | "MEDIUM" | "LOW",
  "confidence": 0.0 to 1.0 (float, overall consensus alignment),
  "recommendation": "string: unified high-level decision (e.g. Controlled inspection of Line C)",
  "reasoning": "string: synthesis of the cross-functional agreement",
  "actionPlanSummary": "string: step-by-step resolution workflow",
  "agents": [
    { "name": "Elena Rostova", "role": "Reliability", "recommendation": "string" },
    { "name": "Wei Chen", "role": "Automation", "recommendation": "string" },
    { "name": "Dr. Markus Vance", "role": "Operations", "recommendation": "string" },
    { "name": "Marcus Jenkins", "role": "Economics", "recommendation": "string" },
    { "name": "Sarah Becker", "role": "EHS", "recommendation": "string" }
  ]
}`;

    const contextPayload = {
      incident: incident ? {
        id: incident.id,
        line: incident.line,
        vibration: incident.value || 4.2,
        threshold: incident.threshold || 3.5
      } : { id: "INC-LC-001", line: "Line C", vibration: 4.2, threshold: 3.5 },
      specialistAssessments: assessments,
      standards: standards ? { id: standards.standardId || "ISO 10816-3", alertLimit: standards.alertCeiling || 3.5 } : null
    };

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: JSON.stringify(contextPayload, null, 2) }
    ];

    const parsedJson = await this._sendChatCompletion(messages, timeoutMs);
    const latencyMs = Math.max(1, Date.now() - startTime);

    return {
      incidentId: incident ? incident.id : "INC-LC-001",
      priority: parsedJson.priority || "HIGH",
      confidence: typeof parsedJson.confidence === 'number' ? Math.min(1.0, Math.max(0.0, parsedJson.confidence)) : 0.92,
      recommendation: parsedJson.recommendation || "Controlled inspection of Line C",
      reasoning: parsedJson.reasoning,
      actionPlanSummary: parsedJson.actionPlanSummary,
      agents: assessments.map(a => {
        const found = Array.isArray(parsedJson.agents) ? parsedJson.agents.find(ag => ag.name && (ag.name.toLowerCase().includes(a.persona.toLowerCase().split(' ')[0]) || a.persona.toLowerCase().includes(ag.name.toLowerCase()))) : null;
        return {
          name: a.persona,
          role: a.role,
          recommendation: found?.recommendation || a.recommendation
        };
      }),
      aiEngine: "LLM",
      aiProvider: this.getProviderName(),
      aiModel: this.getModelName(),
      aiLatencyMs: latencyMs
    };
  }
}

module.exports = new LLMProvider();
