const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Contribution Entry Sub-schema
const contributionSchema = new Schema({
  memberId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  hoursSpent: {
    type: Number,
    min: 0,
    default: 0
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'completed', 'verified'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Comment/Review Sub-schema
const commentSchema = new Schema({
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  role: {
    type: String,
    enum: ['member', 'leader'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Main Task Schema
const taskSchema = new Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    maxlength: 200,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  groupId: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
    index: true
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
  
  // Metadata
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['notStarted', 'inProgress', 'completed', 'onHold'],
    default: 'notStarted'
  },
  
  // Dates
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  startDate: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  completedAt: {
    type: Date,
    default: null
  },
  
  // Ownership
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Contributions Tracking
  contributions: [contributionSchema],
  totalHours: {
    type: Number,
    default: 0
  },
  
  // Progress Tracking
  progressPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  milestones: [{
    title: String,
    description: String,
    dueDate: Date,
    completed: {
      type: Boolean,
      default: false
    },
    completedDate: Date
  }],
  
  // Comments & Review
  comments: [commentSchema],
  
  // Attachments
  attachments: [{
    fileName: String,
    fileUrl: String,
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Export & Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  verificationNotes: String,
  exportHistory: [{
    exportedAt: Date,
    exportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    format: {
      type: String,
      enum: ['pdf', 'csv', 'json'],
      default: 'pdf'
    }
  }],
  
  // Timestamps
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'tasks'
});

// Indexes for optimization
taskSchema.index({ groupId: 1, courseId: 1 });
taskSchema.index({ createdBy: 1, createdAt: -1 });
taskSchema.index({ status: 1, dueDate: 1 });
taskSchema.index({ 'contributions.memberId': 1 });

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  return this.dueDate < new Date() && this.status !== 'completed';
});

// Pre-save middleware to update totalHours
taskSchema.pre('save', function(next) {
  this.totalHours = this.contributions.reduce((sum, contrib) => {
    return sum + (contrib.hoursSpent || 0);
  }, 0);
  this.updatedAt = Date.now();
  next();
});

// Method to get contribution summary for a member
taskSchema.methods.getMemberContribution = function(memberId) {
  return this.contributions.filter(c => c.memberId.toString() === memberId.toString());
};

// Method to calculate member's percentage contribution
taskSchema.methods.getMemberPercentage = function(memberId) {
  if (this.totalHours === 0) return 0;
  const memberHours = this.contributions
    .filter(c => c.memberId.toString() === memberId.toString())
    .reduce((sum, c) => sum + (c.hoursSpent || 0), 0);
  return ((memberHours / this.totalHours) * 100).toFixed(2);
};

// Static method to get tasks for a group
taskSchema.statics.getGroupTasks = function(groupId) {
  return this.find({ groupId })
    .sort({ dueDate: 1 })
    .populate('createdBy', 'name email')
    .populate('assignedTo', 'name email')
    .populate('contributions.memberId', 'name email');
};

// Static method to get overdue tasks
taskSchema.statics.getOverdueTasks = function(groupId) {
  return this.find({
    groupId,
    dueDate: { $lt: new Date() },
    status: { $ne: 'completed' }
  }).sort({ dueDate: 1 });
};

module.exports = mongoose.model('Task', taskSchema);