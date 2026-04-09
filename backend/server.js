require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Serve static frontend ─────────────────────────────────────
app.use(express.static(path.join(__dirname, '../frontend')));

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/cases',         require('./routes/cases'));
app.use('/api/hearings',      require('./routes/hearings'));
app.use('/api/documents',     require('./routes/documents'));
app.use('/api/clients',       require('./routes/clients'));
app.use('/api/fees',          require('./routes/fees'));
app.use('/api/tasks',         require('./routes/tasks'));
app.use('/api/notifications', require('./routes/notifications'));

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ── SPA fallback: FIXED — only serve index.html for extensionless routes ─────
// Static files (.html, .css, .js) are already served above by express.static
// This fallback only fires for clean URL paths like /dashboard
app.get('*', (req, res) => {
  if (req.path.includes('.')) {
    return res.status(404).send('Not found');
  }
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ── Start (local dev only) ────────────────────────────────────
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`LawMate server running on http://localhost:${PORT}`));
}

// REQUIRED for Vercel serverless — export the app
module.exports = app;