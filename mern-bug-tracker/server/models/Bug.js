import mongoose from 'mongoose';

const bugSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Bug title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Bug description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open',
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
    required: true
  },
  assignedTo: {
    type: String,
    trim: true,
    default: ''
  },
  reportedBy: {
    type: String,
    required: [true, 'Reporter name is required'],
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  stepsToReproduce: {
    type: String,
    trim: true,
    default: ''
  },
  expectedBehavior: {
    type: String,
    trim: true,
    default: ''
  },
  actualBehavior: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

// Index for better query performance
bugSchema.index({ status: 1, severity: 1 });
bugSchema.index({ createdAt: -1 });

// Virtual for bug age in days
bugSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Ensure virtual fields are serialized
bugSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Bug', bugSchema);