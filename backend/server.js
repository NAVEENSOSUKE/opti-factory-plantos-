// backend/server.js
// OptiFactory PlantOS AI Industrial Incident-Response Server
// Node.js + Express + SQLite Full-Stack Backend

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';

// 1. CORS Configuration
const allowedOrigins = [
  FRONTEND_URL,
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive for local development convenience
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 2. Request Parsing Middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// 3. Request Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`[INFO] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// 4. Health Endpoint (Mandatory Requirement 3)
app.get('/api/health', (req, res) => {
  res.json({
    status: "ok",
    service: "OptiFactory Backend",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    database: "SQLite (Local Native)"
  });
});

// 5. Mount API Routes
const incidentsRouter = require('./routes/incidents');
const telemetryRouter = require('./routes/telemetry');
const agentsRouter = require('./routes/agents');
const consensusRouter = require('./routes/consensus');
const knowledgeRouter = require('./routes/knowledge');
const maintenanceRouter = require('./routes/maintenance');
const aiRouter = require('./routes/ai');

app.use('/api/incidents', incidentsRouter);
app.use('/api/telemetry', telemetryRouter);
app.use('/api/agents', agentsRouter);
app.use('/api/consensus', consensusRouter);
app.use('/api/knowledge', knowledgeRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/ai', aiRouter);

// 6. Optional Static Asset Serving (Convenience fallback for root & industrial frontend)
const rootDir = path.resolve(__dirname, '..');
app.use(express.static(rootDir));

// 7. Unknown API Route Handler
app.all('/api/*', (req, res) => {
  res.status(404).json({
    error: `API route not found: ${req.method} ${req.path}`,
    status: 404
  });
});

// 8. Global Error Handler
app.use((err, req, res, next) => {
  console.error('[ERROR] Unhandled exception:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message || 'An unexpected error occurred',
    status: 500
  });
});

// 9. Server Initialization
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` 🏭 OPTIFACTORY PLANTOS — BACKEND SERVER RUNNING`);
    console.log(` • Server URL:      http://localhost:${PORT}`);
    console.log(` • Health Check:    http://localhost:${PORT}/api/health`);
    console.log(` • Incident API:    http://localhost:${PORT}/api/incidents`);
    console.log(` • Line C Telemetry:http://localhost:${PORT}/api/telemetry/line-c`);
    console.log(` • Expected UI:     http://localhost:8080/industrial/`);
    console.log(`=======================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[FATAL] Port ${PORT} is already in use. Try configuring another port in .env`);
    } else {
      console.error('[FATAL] Server failed to start:', err);
    }
  });
}

module.exports = app;
