import { validationResult } from 'express-validator';
import { debugLog } from '../utils/debugUtils.js';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));

    debugLog('Validation failed', { errors: errorMessages, body: req.body });

    return res.status(400).json({
      message: 'Validation failed',
      errors: errorMessages
    });
  }

  next();
};