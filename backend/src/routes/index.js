const { Router } = require('express');
const userRoutes = require('./user.routes');
const authRoutes = require('./auth.routes');

const router = Router();

// ── Mount all routes ──────────────────────────────────
router.use('/auth',    authRoutes);
router.use('/users',   userRoutes);

// ── Health check ──────────────────────────────────────
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
