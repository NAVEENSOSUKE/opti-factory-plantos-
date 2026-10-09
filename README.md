# 🏭 OptiFactory PlantOS & 🏆 SportPulse AI — Full-Stack Industrial AI Suite

This repository contains a full-stack, cyber-industrial AI operations platform and a sports intelligence chatbot:

1. **🏭 OptiFactory PlantOS**: Full-Stack Industrial Operations Cockpit powered by **React 18**, **Three.js 3D Digital Twin**, and a **Node.js + Express + SQLite** backend with a **Real AI Orchestration Layer (Groq LLM + Deterministic Physics Engine)**. Features real-time incident detection, 3D machine highlighting, telemetry analytics, specialist AI diagnostics (Elena Rostova), industrial web specification grounding (ISO 10816-3), 5-persona multi-agent consensus deliberation, and end-to-end maintenance workflow with SQLite persistence and offline localStorage fallback.
2. **🏆 SportPulse AI**: Sports Intelligence & Live Rules Chatbot featuring comprehensive sport records, head-to-head comparisons, player statistics, rules engine, voice narration, and persistent trivia high scores.

---

## 🧠 AI Architecture

The OptiFactory intelligence layer utilizes a hybrid orchestration architecture:

```
                            BROWSER CLIENT (React 18)
                                       │
                                       ▼
                          EXPRESS BACKEND (Port 3000)
                                       │
                                       ▼
                           AI ORCHESTRATION LAYER
                         (services/aiOrchestrator.js)
                                       │
                     ┌─────────────────┴─────────────────┐
                     ▼                                   ▼
          EXTERNAL LLM PROVIDER             DETERMINISTIC INDUSTRIAL
             (Groq Cloud API)                   REASONING ENGINE
         • openai/gpt-oss-120b              • ISO 10816-3 Physics Model
         • Structured Context Grounding     • Vibration Harmonic Limits
         • Real Latency Measurement (ms)    • 5-Persona Domain Rules
         • Strict Schema Validation         • Guaranteed 100% Offline
                     │                                   │
                     └─────────────────┬─────────────────┘
                                       ▼
                              UNIFIED AI RESPONSE
                                       │
                                       ▼
                                 BROWSER CLIENT
```

### Dual Engine Capability
* **LLM Connected (`mode: "LLM"`)**: When configured with an API key, the system dispatches structured industrial context (incident telemetry, equipment parameters, ISO standards, specialist personas) to Groq. Real API latency is measured and execution trace steps are logged.
* **Deterministic Fallback (`mode: "LOCAL_REASONING"`)**: If an API key is missing, times out (>8000ms), errors, or returns malformed output, the system seamlessly falls back to the high-fidelity deterministic reasoning engine with zero disruption to the user or Demo Mode.
* **Never Crashes**: The application never crashes due to absent or invalid external AI credentials.

---

## ⚙️ Configuration

Configure the backend environment by creating a `.env` file in the `backend/` directory:

```bash
cp backend/.env.example backend/.env
```

Set the following variables in `backend/.env`:

```env
PORT=3000
FRONTEND_URL=http://localhost:8080

# AI Orchestration Provider (Groq / OpenAI-compatible API)
AI_PROVIDER=groq
AI_API_KEY=your_groq_api_key_here
AI_MODEL=openai/gpt-oss-120b
AI_BASE_URL=https://api.groq.com/openai/v1
```

> **Security Note:** The API key exists strictly on the backend (`backend/.env`). It is never transmitted to the browser, never logged in API responses, never stored in client localStorage, and ignored in Git via `.gitignore`.

### Running Without an AI Provider
To run OptiFactory 100% offline without an external AI provider:
1. Leave `AI_API_KEY` blank or unset.
2. The AI Orchestrator automatically selects `LOCAL_REASONING` mode.
3. The UI displays `AI ENGINE ● LOCAL REASONING` and all incident workflows, 5-persona consensus, and demo sequences continue working identically.

---

## 🚀 Quick Start Guide

### 1. Installation
Install root and backend dependencies:
```bash
npm install
npm run install:all
```

### 2. Running the Full Application
Start the Node.js Express backend and serve the application:
```bash
# Starts backend server on port 3000
npm start
```
Or run the dedicated backend service:
```bash
npm run backend
```
In another terminal, serve the frontend static files on port 8080:
```bash
npm run frontend
# Or with Python:
python -m http.server 8080
```

Once running, navigate to:
* **OptiFactory PlantOS (Industrial Dashboard)**: [http://localhost:8080/industrial/index.html](http://localhost:8080/industrial/index.html)
* **SportPulse AI (Sports Chatbot)**: [http://localhost:8080/index.html](http://localhost:8080/index.html)
* **Backend Health Check**: [http://localhost:3000/api/health](http://localhost:3000/api/health)
* **AI Orchestrator Status**: [http://localhost:3000/api/ai/status](http://localhost:3000/api/ai/status)

### 3. Automated Backend & AI Test Suite
Run the 25-point backend & AI integration test suite:
```bash
npm test
```

---

## 📡 REST API Reference

All endpoints return JSON and provide structured server logs (`[INFO]`, `[WARN]`, `[ERROR]`).

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend liveness and database engine status |
| `GET` | `/api/ai/status` | AI engine mode (`LLM` or `LOCAL_REASONING`) and provider metadata (never leaks key) |
| `GET` | `/api/incidents` | Retrieve full incident history from SQLite |
| `GET` | `/api/incidents/:id` | Retrieve complete dossier for an incident |
| `POST` | `/api/incidents` | Create a new incident (`INC-LC-001`, etc.) |
| `PATCH`| `/api/incidents/:id` | Update status, state, root cause, downtime, or resolution |
| `POST` | `/api/incidents/:id/verify` | Execute post-service vibration verification decay (4.2 -> 2.7 mm/s) |
| `GET` | `/api/telemetry/line-c` | Retrieve Line C telemetry progression |
| `POST` | `/api/telemetry/line-c` | Ingest sensor telemetry and detect threshold anomalies |
| `POST` | `/api/agents/analyze` | Request specialist diagnosis (Elena Rostova / Reliability) via AI Orchestrator |
| `POST` | `/api/consensus` | Run 5-persona multi-agent consensus deliberation and LLM synthesis |
| `GET` | `/api/knowledge/:equipment` | Ground telemetry against ISO 10816-3 and IFM sensor specs |
| `POST` | `/api/maintenance/start` | Transition incident to `MAINTENANCE` and log start timestamp |
| `POST` | `/api/maintenance/complete`| Complete maintenance actions and transition to `VERIFICATION` |

---

## 🔄 Status UI & Transparancy

The application visualizes backend and AI statuses separately:
* **`BACKEND ● CONNECTED`**: Direct connectivity with Express + native SQLite.
* **`AI ENGINE ● LLM CONNECTED (GROQ)`**: Real Groq LLM inference active with live millisecond latency tracking.
* **`AI ENGINE ● LOCAL REASONING`**: High-fidelity ISO 10816-3 deterministic engine active (fallback or keyless mode).
* **Trace Inspector Modal**: Displays real measured AI latency (e.g. `842 ms` for Groq, `3 ms` for Local) and complete execution trace stream.

---

## 🎬 23-Second Automated Demo Mode

Click **`[🎬 Run Demo]`** in the header or hero banner to execute the full automated scenario:
* **0s**: Incident detected & created (`POST /api/incidents`)
* **2s**: 3D Twin highlights Line C with pulsating warning beacon
* **4s**: SCADA telemetry analyzed (`GET /api/telemetry/line-c`)
* **6s**: Elena Rostova reliability diagnosis via AI Orchestrator (`POST /api/agents/analyze`)
* **8s**: Web specification grounding against ISO 10816-3 (`GET /api/knowledge/powertrain-vibratory-feeder`)
* **10s**: 5-specialist multi-agent consensus synthesized (`POST /api/consensus`)
* **13s**: Action plan dispatched (6-step SOP)
* **16s**: Maintenance started (`POST /api/maintenance/start`)
* **20s**: Verification test run (`POST /api/incidents/:id/verify`)
* **23s**: Incident resolved & saved to SQLite database (`PATCH /api/incidents/:id`)
