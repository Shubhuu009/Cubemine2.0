const express = require('express');
const router = express.Router();
const { submitContact } = require('../controllers/contact.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { body, validationResult } = require('express-validator');

const contactValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('topic').isIn(['Bug Report', 'Feature Request', 'Account Issue', 'Solver Problem', 'General Question', 'Feedback / Review', 'Other']).withMessage('Invalid topic'),
  body('message').trim().isLength({ min: 20, max: 2000 }).withMessage('Message must be 20–2000 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array().map((e) => ({ field: e.path, message: e.msg })) });
    }
    next();
  },
];

// Auth is optional — attaches user if logged in
const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    return authenticate(req, res, next);
  }
  next();
};

router.post('/', optionalAuth, contactValidation, submitContact);

module.exports = router;
