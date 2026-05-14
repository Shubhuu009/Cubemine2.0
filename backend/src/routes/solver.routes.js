const express = require('express');
const router = express.Router();
const { solveCube } = require('../controllers/solver.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { solveValidation } = require('../middleware/validation.middleware');
const { solverLimiter } = require('../middleware/rateLimit.middleware');
const { invalidateCache } = require('../middleware/cache.middleware');

// Solving a cube invalidates leaderboard (public) + user's statistics cache
router.post(
  '/solve',
  solverLimiter,
  authenticate,
  solveValidation,
  invalidateCache(['route:leaderboard*', 'user::userId:statistics*']),
  solveCube
);

module.exports = router;
