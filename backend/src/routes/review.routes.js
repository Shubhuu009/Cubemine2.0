const express = require('express');
const router = express.Router();
const { getReviews, submitReview, voteHelpful } = require('../controllers/review.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { cacheRoute, invalidateCache } = require('../middleware/cache.middleware');
const { body, validationResult } = require('express-validator');

const reviewValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1–5'),
  body('body').trim().isLength({ min: 10, max: 1000 }).withMessage('Review must be 10–1000 characters'),
  body('cubeType').optional().isIn(['2x2', '3x3', '4x4', '5x5', 'general']),
  body('title').optional().trim().isLength({ max: 100 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array().map((e) => ({ field: e.path, message: e.msg })) });
    }
    next();
  },
];

// GET /api/reviews — public, cached 60s
router.get('/', cacheRoute('reviews', 60), getReviews);

// POST /api/reviews — requires auth
router.post('/', authenticate, reviewValidation, invalidateCache(['route:reviews*']), submitReview);

// PUT /api/reviews/:id/helpful — requires auth
router.put('/:id/helpful', authenticate, voteHelpful);

module.exports = router;
