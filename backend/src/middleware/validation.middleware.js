const { body, validationResult } = require('express-validator');


const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};


const signupValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be 3-30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),

  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),

  handleValidationErrors,
];


const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors,
];

const googleLoginValidation = [
  body('credential')
    .notEmpty()
    .withMessage('Google credential is required')
    .isString()
    .withMessage('Google credential must be a string'),

  handleValidationErrors,
];


const solveValidation = [
  body('cubeType')
    .isIn(['2x2', '3x3', '4x4', '5x5'])
    .withMessage('Cube type must be "2x2", "3x3", "4x4", or "5x5"'),

  body('state')
    .isArray()
    .withMessage('Cube state must be an array'),

  handleValidationErrors,
];

module.exports = { signupValidation, loginValidation, googleLoginValidation, solveValidation };
