// backend/tests/api.test.js
// Automated verification test suite for OptiFactory PlantOS REST API endpoints & AI Orchestrator Layer

const app = require('../server');
const http = require('http');
const aiOrchestrator = require('../services/aiOrchestrator');
const { localProvider } = require('../services/providers');

let server;
let port = 3099; // Isolated test port

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: '127.0.0.1',
      port: port,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          const json = raw ? JSON.parse(raw) : null;
          resolve({ status: res.statusCode, headers: res.headers, data: json, raw });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data: raw, raw });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting OptiFactory Backend & AI Orchestrator Automated Test Suite...\n');
  server = app.listen(port);

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await request('GET', '/api/health');
    assert(health.status === 200 && health.data.status === 'ok', 'GET /api/health returns status 200 ok');

    // 2. Incident List
    const incidentsRes = await request('GET', '/api/incidents');
    assert(incidentsRes.status === 200 && Array.isArray(incidentsRes.data), 'GET /api/incidents returns array');

    // 3. Create Incident
    const newInc = {
      line: 'Line C',
      machine: 'Powertrain & Vibratory Feeder #2',
      type: 'Vibration Anomaly',
      severity: 'HIGH',
      value: 4.2,
      threshold: 3.5
    };
    const createRes = await request('POST', '/api/incidents', newInc);
    assert(createRes.status === 201 && createRes.data.id && createRes.data.value === 4.2, `POST /api/incidents creates incident (${createRes.data?.id})`);
    const createdId = createRes.data.id;

    // 4. Get Specific Incident
    const getRes = await request('GET', `/api/incidents/${createdId}`);
    assert(getRes.status === 200 && getRes.data.id === createdId, `GET /api/incidents/${createdId} returns incident details`);

    // 5. Telemetry
    const telemetryRes = await request('GET', '/api/telemetry/line-c');
    assert(telemetryRes.status === 200 && Array.isArray(telemetryRes.data) && telemetryRes.data.length >= 6, 'GET /api/telemetry/line-c returns telemetry timeline');

    const addTel = await request('POST', '/api/telemetry/line-c', { vibration: 4.3 });
    assert(addTel.status === 201 && addTel.data.isAnomaly === true, 'POST /api/telemetry/line-c flags vibration > 3.5 as anomaly');

    // 6. Specialist AI Analysis (Elena Rostova)
    const agentRes = await request('POST', '/api/agents/analyze', {
      incidentId: createdId,
      persona: 'Elena Rostova'
    });
    assert(
      agentRes.status === 200 &&
      agentRes.data.persona === 'Elena Rostova' &&
      agentRes.data.confidence >= 0.8 &&
      Boolean(agentRes.data.diagnosis) &&
      Array.isArray(agentRes.data.possibleCauses),
      'POST /api/agents/analyze returns Elena Rostova diagnostic analysis'
    );

    // 7. Multi-Agent Consensus
    const consensusRes = await request('POST', '/api/consensus', { incidentId: createdId });
    assert(
      consensusRes.status === 200 &&
      consensusRes.data.agents?.length === 5 &&
      consensusRes.data.confidence >= 0.8 &&
      Boolean(consensusRes.data.actionPlanSummary),
      'POST /api/consensus synthesizes 5 personas with high confidence'
    );

    // 8. Equipment Knowledge Grounding
    const knowledgeRes = await request('GET', '/api/knowledge/powertrain-vibratory-feeder');
    assert(knowledgeRes.status === 200 && knowledgeRes.data.standard?.standardId === 'ISO 10816-3', 'GET /api/knowledge/powertrain-vibratory-feeder grounds ISO 10816-3');

    // 9. Maintenance Start
    const maintStart = await request('POST', '/api/maintenance/start', { incidentId: createdId });
    assert(maintStart.status === 200 && maintStart.data.state === 'MAINTENANCE', 'POST /api/maintenance/start updates state to MAINTENANCE');

    // 10. Maintenance Complete
    const maintComplete = await request('POST', '/api/maintenance/complete', { incidentId: createdId });
    assert(maintComplete.status === 200 && maintComplete.data.state === 'VERIFICATION', 'POST /api/maintenance/complete advances state to VERIFICATION');

    // 11. Verification Decay
    const verifyRes = await request('POST', `/api/incidents/${createdId}/verify`);
    assert(verifyRes.status === 200 && verifyRes.data.verified === true && verifyRes.data.vibration === 2.7, 'POST /api/incidents/:id/verify decays vibration to 2.7 mm/s and verifies');

    // 12. Patch Incident to RESOLVED
    const patchRes = await request('PATCH', `/api/incidents/${createdId}`, {
      status: 'RESOLVED',
      state: 'RESOLVED',
      rootCause: 'Bearing unbalance & chassis mount looseness',
      correctiveAction: 'Re-torqued bolts to 85 Nm, greased bearings, returned to 50.2 Hz',
      downtime: 14
    });
    assert(patchRes.status === 200 && patchRes.data.status === 'RESOLVED' && patchRes.data.downtime === 14, 'PATCH /api/incidents/:id resolves incident with downtime and root cause');

    // 13. Security & Validation Errors
    const notFoundRes = await request('GET', '/api/incidents/NON_EXISTENT_999');
    assert(notFoundRes.status === 404, 'GET /api/incidents/NON_EXISTENT_999 returns 404');

    const badTelemetry = await request('POST', '/api/telemetry/line-c', { vibration: 'not-a-number' });
    assert(badTelemetry.status === 400, 'POST /api/telemetry/line-c with invalid payload returns 400');

    const unknownRoute = await request('GET', '/api/unknown-service');
    assert(unknownRoute.status === 404, 'GET unknown route returns 404 JSON');

    // ==========================================
    // NEW AI ORCHESTRATOR & PROVIDER TESTS (Req 21)
    // ==========================================

    // 14. AI Status with Configured Provider
    const aiStatus = await request('GET', '/api/ai/status');
    assert(
      aiStatus.status === 200 &&
      typeof aiStatus.data.available === 'boolean' &&
      aiStatus.data.mode &&
      aiStatus.data.provider,
      'GET /api/ai/status returns provider metadata and operational mode'
    );

    // 15. Security Check: API Key is NEVER exposed in any response
    const allResponsesStr = JSON.stringify({
      status: aiStatus.data,
      agent: agentRes.data,
      consensus: consensusRes.data
    });
    const leakedKey = Boolean(process.env.AI_API_KEY && allResponsesStr.includes(process.env.AI_API_KEY));
    assert(!leakedKey, 'SECURITY: API key is never leaked in status, agent, or consensus responses');

    // 16. AI Latency Tracking & Traces
    assert(
      typeof agentRes.data.aiLatencyMs === 'number' &&
      agentRes.data.aiLatencyMs >= 0 &&
      Array.isArray(agentRes.data.traces) &&
      agentRes.data.traces.length >= 4,
      'AI Orchestrator measures real numeric latency and returns structured execution trace'
    );

    // 17. Specialist AI Response Validation Layer
    const validSpecialistMock = {
      diagnosis: 'Mechanical unbalance on Line C',
      possibleCauses: ['Chassis mount looseness'],
      recommendation: 'Re-torque bolts to 85 Nm',
      confidence: 0.94
    };
    assert(aiOrchestrator.validateSpecialistResponse(validSpecialistMock) === true, 'AI Validator accepts properly structured specialist response');

    // 18. Specialist AI Response Rejection on Missing Attributes
    const invalidMock1 = { possibleCauses: ['Bearing wear'], recommendation: 'Inspect', confidence: 0.8 };
    const invalidMock2 = { diagnosis: 'Trip', possibleCauses: [], recommendation: 'Inspect', confidence: 0.8 };
    const invalidMock3 = { diagnosis: 'Trip', possibleCauses: ['A'], recommendation: 'Inspect', confidence: 1.5 }; // Out of bounds
    assert(
      aiOrchestrator.validateSpecialistResponse(invalidMock1) === false &&
      aiOrchestrator.validateSpecialistResponse(invalidMock2) === false &&
      aiOrchestrator.validateSpecialistResponse(invalidMock3) === false,
      'AI Validator rejects responses with missing fields or confidence outside [0, 1]'
    );

    // 19. Consensus Response Validation Layer
    const validConsensusMock = {
      priority: 'HIGH',
      confidence: 0.92,
      recommendation: 'Controlled ramp-down',
      reasoning: 'Bearing cage fatigue confirmed',
      agents: [{ name: 'Elena Rostova', role: 'Reliability', recommendation: 'Inspect' }]
    };
    assert(aiOrchestrator.validateConsensusResponse(validConsensusMock) === true, 'AI Validator accepts valid cross-functional consensus schema');

    // 20. Deterministic Local Reasoning Fallback
    const localEval = localProvider.analyzePersona({
      persona: { name: 'Elena Rostova', role: 'Reliability & Vibration Specialist' },
      incident: { value: 4.2, threshold: 3.5 }
    });
    assert(
      localEval.aiEngine === 'LOCAL_REASONING' &&
      localEval.confidence >= 0.9 &&
      localEval.diagnosis.includes('4.2 mm/s'),
      'Deterministic fallback generates ISO 10816-3 grounded analysis'
    );

    // 21. Deterministic Consensus Fallback
    const localConsensus = localProvider.synthesizeConsensus({ incident: { id: 'INC-LC-001', value: 4.2 } });
    assert(
      localConsensus.agents.length === 5 &&
      localConsensus.confidence === 0.92 &&
      localConsensus.priority === 'HIGH',
      'Deterministic consensus synthesizes all 5 industrial personas with 92% confidence'
    );

    // 22. AI Status with Unconfigured / Missing API Key
    const originalKey = process.env.AI_API_KEY;
    try {
      delete process.env.AI_API_KEY;
      const unconfiguredStatus = aiOrchestrator.getAiStatus();
      assert(
        unconfiguredStatus.available === false &&
        unconfiguredStatus.mode === 'LOCAL_REASONING',
        'AI Orchestrator safely returns LOCAL_REASONING mode when API key is absent'
      );
    } finally {
      process.env.AI_API_KEY = originalKey;
    }

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    server.close();
    console.log(`\n===========================================`);
    console.log(` Tests Completed: ${passed + failed}`);
    console.log(` ✅ Passed:        ${passed}`);
    console.log(` ❌ Failed:        ${failed}`);
    console.log(`===========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  }
}

runTests();
