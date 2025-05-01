const { body, validationResult } = require('express-validator');
const SendResponse = require('../../helper/sendResponse');

const response = new SendResponse();

// Middleware to validate registration input
const validateRegistrationInput = [
  // Basic user information
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('phoneNumber')
    .optional()
    .trim()
    .matches(/^\+?[0-9\s\-\(\)]+$/).withMessage('Invalid phone number format'),
  
  // Custom validation middleware to check for validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return response.error(
        res,
        'Validation failed',
        422,
        { errors: errors.array() }
      );
    }
    next();
  }
];

// Middleware to validate login input
const validateLoginInput = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required'),
  
  body('accountType')
    .optional()
    .isIn(['landlord', 'seeker']).withMessage('Account type must be either landlord or seeker'),
  
  // Custom validation middleware to check for validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return response.error(
        res,
        'Validation failed',
        422,
        { errors: errors.array() }
      );
    }
    next();
  }
];


const validateForgotPasswordInput = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return response.error(
        res,
        'Validation failed',
        422,
        { errors: errors.array() }
      );
    }
    next();
  }
];


const validateResetPasswordInput = [
  body('token')
    .trim()
    .notEmpty().withMessage('Token is required'),
  
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return response.error(
        res,
        'Validation failed',
        422,
        { errors: errors.array() }
      );
    }
    next();
  }
];

module.exports = {
  validateRegistrationInput,
  validateLoginInput,
  validateForgotPasswordInput,
  validateResetPasswordInput
};