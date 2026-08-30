import { body, param, validationResult } from 'express-validator';

export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
}

export const validateNewThread = [
  body('subject').optional().isString().trim().isLength({ max: 100 }),
  body('name').optional().isString().trim().isLength({ max: 60 }),
  body('body').isString().trim().isLength({ min: 1, max: 4000 }),
  param('boardSlug').isString().trim().isLength({ min: 1, max: 20 }),
  handleValidationErrors,
];

export const validateNewPost = [
  body('name').optional().isString().trim().isLength({ max: 60 }),
  body('body').isString().trim().isLength({ min: 1, max: 4000 }),
  param('threadId').isInt({ min: 1 }),
  handleValidationErrors,
];

export const validateLogin = [
  body('username').isString().trim().isLength({ min: 1, max: 50 }),
  body('password').isString().isLength({ min: 1, max: 200 }),
  handleValidationErrors,
];
