require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/students',     require('./routes/students'));
app.use('/api/faculty',      require('./routes/faculty'));
app.use('/api/rooms',        require('./routes/rooms'));
app.use('/api/exams',        require('./routes/exams'));
app.use('/api/seating',      require('./routes/seating'));
app.use('/api/invigilation', require('./routes/invigilation'));
app.use('/api/attendance',   require('./routes/attendance'));
app.use('/api/replacements', require('./routes/replacements'));
app.use('/api/reports',      require('./routes/reports'));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'GBU Exam Management System API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ error: 'Internal server error', detail: err.message });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 GBU Exam System API running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`\n📌 Available endpoints:`);
  console.log(`   POST   /api/auth/login`);
  console.log(`   GET    /api/students`);
  console.log(`   GET    /api/faculty`);
  console.log(`   GET    /api/rooms`);
  console.log(`   GET    /api/exams`);
  console.log(`   POST   /api/seating/generate`);
  console.log(`   POST   /api/invigilation/generate`);
  console.log(`   POST   /api/attendance/mark`);
  console.log(`   POST   /api/attendance/qr-scan`);
  console.log(`   GET    /api/reports/dashboard\n`);
});
