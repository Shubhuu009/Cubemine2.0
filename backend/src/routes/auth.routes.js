const express = require('express');
const router = express.Router();
const { signup, login, googleLogin } = require('../controllers/auth.controller');
const { signupValidation, loginValidation, googleLoginValidation } = require('../middleware/validation.middleware');
const { authLimiter } = require('../middleware/rateLimit.middleware');
router.post('/signup', authLimiter, signupValidation, signup);
router.post('/login', authLimiter, loginValidation, login);
router.post('/google', authLimiter, googleLoginValidation, googleLogin);

module.exports = router;
