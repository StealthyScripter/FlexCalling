import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  return next();
};

/**
 * Custom phone number validator
 */
export const isValidPhone = (phone: string): boolean => {
  try {
    return isValidPhoneNumber(phone);
  } catch {
    return false;
  }
};

/**
 * Normalize phone number to E.164 format
 */
export const normalizePhone = (phone: string): string => {
  try {
    const parsed = parsePhoneNumber(phone);
    return parsed.number;
  } catch {
    return phone;
  }
};

// ============================================
// VALIDATION RULES
// ============================================

export const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .custom((value) => {
      if (!isValidPhone(value)) {
        throw new Error('Invalid phone number format');
      }
      return true;
    }),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),

  handleValidationErrors,
];

export const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors,
];

export const createContactValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .custom((value) => {
      if (!isValidPhone(value)) {
        throw new Error('Invalid phone number format');
      }
      return true;
    }),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),

  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location must be less than 200 characters'),

  body('favorite')
    .optional()
    .isBoolean()
    .withMessage('Favorite must be a boolean'),

  body('avatarColor')
    .trim()
    .notEmpty()
    .withMessage('Avatar color is required')
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Avatar color must be a valid hex color'),

  handleValidationErrors,
];

export const updateContactValidation = [
  param('contactId')
    .isUUID()
    .withMessage('Invalid contact ID'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),

  body('phone')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !isValidPhone(value)) {
        throw new Error('Invalid phone number format');
      }
      return true;
    }),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),

  body('favorite')
    .optional()
    .isBoolean()
    .withMessage('Favorite must be a boolean'),

  handleValidationErrors,
];

export const makeCallValidation = [
  body('to')
    .trim()
    .notEmpty()
    .withMessage('Destination phone number is required')
    .custom((value) => {
      if (!isValidPhone(value)) {
        throw new Error('Invalid destination phone number');
      }
      return true;
    }),

  body('from')
    .trim()
    .notEmpty()
    .withMessage('Caller phone number is required')
    .custom((value) => {
      if (!isValidPhone(value)) {
        throw new Error('Invalid caller phone number');
      }
      return true;
    }),

  handleValidationErrors,
];

export const userIdParamValidation = [
  param('userId')
    .isUUID()
    .withMessage('Invalid user ID'),

  handleValidationErrors,
];

export const updateBalanceValidation = [
  param('userId')
    .isUUID()
    .withMessage('Invalid user ID'),

  body('balance')
    .isFloat({ min: 0 })
    .withMessage('Balance must be a positive number'),

  handleValidationErrors,
];

export const callHistoryQueryValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  handleValidationErrors,
];
