const AuthService = require('../services/auth.service');
const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const result = await AuthService.signup({ username, email, password });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login({ email, password });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;
    const result = await AuthService.googleLogin({ credential });

    res.status(200).json({
      success: true,
      message: 'Google login successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, login, googleLogin };
