const { check } = require('express-validator');

const registerValidation = [
  check('username').notEmpty().withMessage('Username is required'),
  check('firstName').notEmpty().withMessage('First Name is required'),
  check('lastName').notEmpty().withMessage('Last Name is required'),
  check('email').isEmail().withMessage('Please include a valid email'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
  check('email').isEmail().withMessage('Please include a valid email'),
  check('password').exists().withMessage('Password is required')
];

const forgotPasswordValidation = [
  check('email').isEmail().withMessage('Please include a valid email')
];

const verifyOtpValidation = [
  check('email').isEmail().withMessage('Please include a valid email'),
  check('otp').notEmpty().withMessage('OTP is required')
];

const resetPasswordValidation = [
  check('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

module.exports = {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  verifyOtpValidation,
  resetPasswordValidation
};
