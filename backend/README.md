# OptiFactory PlantOS — Backend Service

The Node.js + Express backend service powers the industrial incident-response lifecycle for **OptiFactory PlantOS**.

## Architecture Overview

```
Browser (React 18 + Three.js)
  │
  ├── [API Client: industrial/api.js]
  │        │ (REST / JSON via Fetch)
  ▼        ▼
Express Server (http://localhost:3000)
  │
  ├── /api/health       -> Health Check & Status
  ├── /api/incidents    -> Incident Lifecycle Management & History
  ├── /api/telemetry    -> Sensor Streams & Threshold Detection
  ├── /api/agents       -> Specialist Persona AI Diagnosis
  ├── /api/consensus    -> Multi-Agent Consensus Engine (5 Personas)
  ├── /api/knowledge    -> Equipment Specification Grounding (ISO 10816-3)
  └── /api/maintenance  -> Maintenance SOP Execution & Verification
           │
           ▼
     SQLite Engine (backend/data/optifactory.sqlite)
```

## REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend liveness and database verification check |
| `GET` | `/api/incidents` | Retrieve full incident history from SQLite |
| `GET` | `/api/incidents/:id` | Retrieve complete details for a specific incident |
| `POST` | `/api/incidents` | Create a new incident (generates sequential/custom ID) |
| `PATCH`| `/api/incidents/:id` | Update status, root cause, corrective action, downtime |
| `POST` | `/api/incidents/:id/verify` | Execute 4-stage vibration decay verification (4.2 -> 2.7 mm/s) |
| `GET` | `/api/telemetry/line-c` | Retrieve Line C historical telemetry timeline |
| `POST` | `/api/telemetry/line-c` | Ingest real-time sensor reading and detect threshold anomaly |
| `POST` | `/api/agents/analyze` | Run specialist persona diagnosis (Elena Rostova / Reliability) |
| `POST` | `/api/consensus` | Run multi-agent consensus across all 5 industrial personas |
| `GET` | `/api/knowledge/:equipment` | Ground telemetry against ISO 10816-3 & IFM sensor datasheets |
| `POST` | `/api/maintenance/start` | Transition incident to `MAINTENANCE` and log start timestamp |
| `POST` | `/api/maintenance/complete`| Complete maintenance actions and transition to `VERIFICATION` |

## Database Schema (SQLite)

### 1. `incidents`
* `id` (TEXT PRIMARY KEY) — e.g. `INC-LC-001`
* `line` (TEXT) — e.g. `Line C`
* `machine` (TEXT) — e.g. `Powertrain & Vibratory Feeder #2`
* `type` (TEXT) — e.g. `Vibration Anomaly`
* `severity` (TEXT) — `HIGH` / `MEDIUM` / `LOW`
* `value` (REAL) — e.g. `4.2`
* `threshold` (REAL) — e.g. `3.5`
* `status` (TEXT) — `OPEN` / `RESOLVED`
* `state` (TEXT) — `DETECTED` / `ANALYZING` / `CONSENSUS` / `ACTION_REQUIRED` / `MAINTENANCE` / `VERIFICATION` / `RESOLVED`
* `detectedAt` (TEXT)
* `resolvedAt` (TEXT)
* `downtime` (REAL)
* `rootCause` (TEXT)
* `correctiveAction` (TEXT)
* `groundingSpec` (TEXT)
* `consensusScore` (REAL)

### 2. `telemetry`
* `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
* `line` (TEXT)
* `timestamp` (TEXT)
* `vibration` (REAL)
* `status` (TEXT)

### 3. `maintenance`
* `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
* `incidentId` (TEXT)
* `step` (INTEGER)
* `stepName` (TEXT)
* `status` (TEXT)
* `startedAt` (TEXT)
* `completedAt` (TEXT)

## Running the Backend

From the project root:
```bash
npm install
npm run backend
```
Or directly from `backend/`:
```bash
cd backend
npm install
npm start
```
Server starts on port `3000` (configurable via `.env`).
