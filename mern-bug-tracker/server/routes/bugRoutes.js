import express from 'express';
import { body } from 'express-validator';
import {
  getBugs,
  getBugById,
  createBug,
  updateBug,
  deleteBug,
  getBugStats
} from '../controllers/bugController.js';
import { validateRequest } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Validation rules
const bugValidationRules = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('severity')
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Severity must be low, medium, high, or critical'),
  body('priority')
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('reportedBy')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Reporter name must be between 2 and 50 characters')
];

const updateValidationRules = [
  body('status')
    .optional()
    .isIn(['open', 'in-progress', 'resolved', 'closed'])
    .withMessage('Status must be open, in-progress, resolved, or closed'),
  body('assignedTo')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Assigned to must not exceed 50 characters')
];

// Routes
router.route('/')
  .get(getBugs)
  .post(bugValidationRules, validateRequest, createBug);

router.get('/stats', getBugStats);

router.route('/:id')
  .get(getBugById)
  .put(updateValidationRules, validateRequest, updateBug)
  .delete(deleteBug);

export default router;