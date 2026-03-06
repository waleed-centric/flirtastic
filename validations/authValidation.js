const { check } = require('express-validator');

const registerValidation = [
  check('username').notEmpty().withMessage('Username is required'),
  check('email').isEmail().withMessage('Please include a valid email'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
  check('email').isEmail().withMessage('Please include a valid email'),
  check('password').exists().withMessage('Password is required')
];

module.exports = {
  registerValidation,
  loginValidation
};
