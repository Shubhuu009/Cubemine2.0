const express = require('express');
const router = express.Router();
const { getProfile, getHistory, getLeaderboard, getStatistics } = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { cacheRoute, cacheUserRoute } = require('../middleware/cache.middleware');

// ─── Profile (no cache — always fresh) ──────────────────
router.get('/profile', authenticate, getProfile);

// ─── History (no cache — paginated, user-specific) ──────
router.get('/history', authenticate, getHistory);

// ─── Leaderboard (public, cached 30s) ───────────────────
router.get('/leaderboard', cacheRoute('leaderboard', 30), getLeaderboard);

// ─── Statistics (per-user, cached 45s) ──────────────────
router.get('/statistics', authenticate, cacheUserRoute('statistics', 45), getStatistics);

module.exports = router;
