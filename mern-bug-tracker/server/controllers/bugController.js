import Bug from '../models/Bug.js';
import { debugLog } from '../utils/debugUtils.js';
import { validateBugData, sanitizeBugData } from '../utils/bugUtils.js';

// @desc    Get all bugs with filtering and pagination
// @route   GET /api/bugs
// @access  Public
export const getBugs = async (req, res) => {
  try {
    const { status, severity, priority, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (priority) filter.priority = priority;

    debugLog('Getting bugs with filter', { filter, page, limit });

    const bugs = await Bug.find(filter)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Bug.countDocuments(filter);

    res.json({
      bugs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    debugLog('Error getting bugs', { error: error.message });
    res.status(500).json({ message: 'Server error while fetching bugs' });
  }
};

// @desc    Get single bug
// @route   GET /api/bugs/:id
// @access  Public
export const getBugById = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id);

    if (!bug) {
      return res.status(404).json({ message: 'Bug not found' });
    }

    debugLog('Bug retrieved', { bugId: bug._id });
    res.json(bug);
  } catch (error) {
    debugLog('Error getting bug by ID', { error: error.message, id: req.params.id });
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid bug ID format' });
    }
    
    res.status(500).json({ message: 'Server error while fetching bug' });
  }
};

// @desc    Create new bug
// @route   POST /api/bugs
// @access  Public
export const createBug = async (req, res) => {
  try {
    // Sanitize input data
    const sanitizedData = sanitizeBugData(req.body);
    
    // Additional validation
    const validationError = validateBugData(sanitizedData);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const bug = new Bug(sanitizedData);
    const createdBug = await bug.save();

    debugLog('Bug created', { bugId: createdBug._id, title: createdBug.title });
    res.status(201).json(createdBug);
  } catch (error) {
    debugLog('Error creating bug', { error: error.message, body: req.body });
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error while creating bug' });
  }
};

// @desc    Update bug
// @route   PUT /api/bugs/:id
// @access  Public
export const updateBug = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id);

    if (!bug) {
      return res.status(404).json({ message: 'Bug not found' });
    }

    // Sanitize update data
    const sanitizedData = sanitizeBugData(req.body);
    
    const updatedBug = await Bug.findByIdAndUpdate(
      req.params.id,
      sanitizedData,
      { new: true, runValidators: true }
    );

    debugLog('Bug updated', { bugId: updatedBug._id, changes: sanitizedData });
    res.json(updatedBug);
  } catch (error) {
    debugLog('Error updating bug', { error: error.message, id: req.params.id });
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid bug ID format' });
    }
    
    res.status(500).json({ message: 'Server error while updating bug' });
  }
};

// @desc    Delete bug
// @route   DELETE /api/bugs/:id
// @access  Public
export const deleteBug = async (req, res) => {
  try {
    const bug = await Bug.findById(req.params.id);

    if (!bug) {
      return res.status(404).json({ message: 'Bug not found' });
    }

    await Bug.findByIdAndDelete(req.params.id);

    debugLog('Bug deleted', { bugId: req.params.id });
    res.json({ message: 'Bug removed successfully' });
  } catch (error) {
    debugLog('Error deleting bug', { error: error.message, id: req.params.id });
    
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid bug ID format' });
    }
    
    res.status(500).json({ message: 'Server error while deleting bug' });
  }
};

// @desc    Get bug statistics
// @route   GET /api/bugs/stats
// @access  Public
export const getBugStats = async (req, res) => {
  try {
    const stats = await Bug.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          open: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
          critical: { $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] } },
          high: { $sum: { $cond: [{ $eq: ['$severity', 'high'] }, 1, 0] } },
          medium: { $sum: { $cond: [{ $eq: ['$severity', 'medium'] }, 1, 0] } },
          low: { $sum: { $cond: [{ $eq: ['$severity', 'low'] }, 1, 0] } }
        }
      }
    ]);

    const result = stats[0] || {
      total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0,
      critical: 0, high: 0, medium: 0, low: 0
    };

    debugLog('Bug stats retrieved', result);
    res.json(result);
  } catch (error) {
    debugLog('Error getting bug stats', { error: error.message });
    res.status(500).json({ message: 'Server error while fetching statistics' });
  }
};