const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getHistory, getLeaderboard, getStatistics, getPreferences, updatePreferences, deleteAccount } = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { cacheRoute, cacheUserRoute, invalidateCache } = require('../middleware/cache.middleware');
const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array().map((e) => ({ field: e.path, message: e.msg })) });
  }
  next();
};

const updateProfileValidation = [
  body('username').optional().trim().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
  body('avatar').optional({ nullable: true }).isURL().withMessage('Avatar must be a valid URL'),
  validate,
];

const updatePreferencesValidation = [
  body('theme').optional().isIn(['dark', 'light']),
  body('showTimer').optional().isBoolean(),
  body('enableKeyboardShortcuts').optional().isBoolean(),
  body('enableNotifications').optional().isBoolean(),
  validate,
];

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfileValidation, invalidateCache(['user::userId:*']), updateProfile);
router.get('/preferences', authenticate, getPreferences);
router.put('/preferences', authenticate, updatePreferencesValidation, updatePreferences);
router.delete('/me', authenticate, deleteAccount);
router.get('/history', authenticate, getHistory);
router.get('/leaderboard', cacheRoute('leaderboard', 30), getLeaderboard);
router.get('/statistics', authenticate, cacheUserRoute('statistics', 45), getStatistics);

module.exports = router;
