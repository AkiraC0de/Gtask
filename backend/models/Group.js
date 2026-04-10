const mongoose = require('mongoose');

const memberSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['leader', 'member', 'co-leader'],
    default: 'member'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'left', 'removed'],
    default: 'active'
  },
  totalContributions: {
    type: Number,
    default: 0 // Total number of contributions
  },
  totalHours: {
    type: Number,
    default: 0 // Total hours contributed across all tasks
  },
  averageContributionPercentage: {
    type: Number,
    default: 0, // Percentage of total group effort
    min: 0,
    max: 100
  }
}, { _id: false });

// Invitation Sub-schema
const invitationSchema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'expired'],
    default: 'pending'
  },
  invitedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  invitedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 7 * 24 * 60 * 60 * 1000) // 7 days
  },
  respondedAt: Date
}, { _id: false });


const settingsSchema = new Schema({
  isPrivate: {
    type: Boolean,
    default: true
  },
  allowMemberInvitations: {
    type: Boolean,
    default: true
  },
  requireLeaderApprovalForTasks: {
    type: Boolean,
    default: false
  },
  autoCalculateContributions: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const groupSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    maxlength: 200,
    trim: true
  },
  description: {
    type: String,
    maxlength: 1000,
    default: ''
  },
  
  // Group Leadership
  leader: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  coLeaders: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Members Management
  members: [memberSchema],
  maxMembers: {
    type: Number,
    default: 8,
    min: 2,
    max: 15
  },
  
  // Invitations
  invitations: [invitationSchema],
  
  // Group Statistics
  stats: {
    totalTasks: {
      type: Number,
      default: 0
    },
    completedTasks: {
      type: Number,
      default: 0
    },
    totalHours: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    averageTaskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  
  // Settings
  settings: {
    type: settingsSchema,
    default: () => ({})
  },
  
  // Group Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived', 'disbanded'],
    default: 'active'
  },
  
  // Project/Group Banner
  bannerUrl: {
    type: String,
    default: null
  },
  
  // Dates
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  archivedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
});

groupSchema.index({ leader: 1, status: 1 });
groupSchema.index({ 'members.userId': 1 });
groupSchema.index({ createdAt: -1 });

// Virtual to get active member count
groupSchema.virtual('activeMemberCount').get(function() {
  return this.members.filter(m => m.status === 'active').length;
});

// Virtual to check if group is full
groupSchema.virtual('isFull').get(function() {
  const activeCount = this.members.filter(m => m.status === 'active').length;
  return activeCount >= this.maxMembers;
});

// Pre-save middleware to update updatedAt
groupSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

groupSchema.methods.addMember = function(userId, role = 'member') {
  // Check if already exists
  const exists = this.members.some(m => m.userId.toString() === userId.toString());
  if (exists) {
    throw new Error('User is already a member of this group');
  }
  
  // Check if group is full
  const activeCount = this.members.filter(m => m.status === 'active').length;
  if (activeCount >= this.maxMembers) {
    throw new Error('Group is full');
  }
  
  this.members.push({
    userId,
    role,
    joinedAt: new Date(),
    status: 'active'
  });
  
  return this;
};

// Method to remove member
groupSchema.methods.removeMember = function(userId, reason = 'left') {
  const member = this.members.find(m => m.userId.toString() === userId.toString());
  if (!member) {
    throw new Error('Member not found');
  }
  
  member.status = reason === 'removed' ? 'removed' : 'left';
  return this;
};

// Method to invite member
groupSchema.methods.inviteMember = function(email, invitedBy) {
  // Check if already invited
  const exists = this.invitations.some(i => i.email === email.toLowerCase());
  if (exists) {
    throw new Error('User already invited');
  }
  
  this.invitations.push({
    email: email.toLowerCase(),
    status: 'pending',
    invitedBy,
    invitedAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });
  
  return this;
};


// Method to update member stats
groupSchema.methods.updateMemberStats = function(userId, hoursAdded, isNewContribution = false) {
  const member = this.getMember(userId);
  if (!member) {
    throw new Error('Member not found');
  }
  
  member.totalHours += hoursAdded;
  if (isNewContribution) {
    member.totalContributions += 1;
  }
  
  // Recalculate average contribution percentage
  this.recalculateContributionPercentages();
  
  return this;
};

// Method to recalculate all member contribution percentages
groupSchema.methods.recalculateContributionPercentages = function() {
  const activeMembers = this.members.filter(m => m.status === 'active');
  const totalHours = activeMembers.reduce((sum, m) => sum + m.totalHours, 0);
  
  if (totalHours === 0) {
    activeMembers.forEach(m => m.averageContributionPercentage = 0);
  } else {
    activeMembers.forEach(m => {
      m.averageContributionPercentage = parseFloat(
        ((m.totalHours / totalHours) * 100).toFixed(2)
      );
    });
  }
  
  return this;
};

// Static method to get groups by course
groupSchema.statics.getGroupsByCourse = function(courseId, academicYear, semester) {
  return this.find({
    courseId,
    academicYear,
    semester,
    status: 'active'
  })
    .populate('leader', 'name email')
    .populate('members.userId', 'name email')
    .sort({ createdAt: -1 });
};

// Static method to get user's groups
groupSchema.statics.getUserGroups = function(userId) {
  return this.find({
    $or: [
      { leader: userId },
      { 'members.userId': userId, 'members.status': 'active' }
    ],
    status: { $ne: 'disbanded' }
  })
    .populate('leader', 'name email')
    .sort({ createdAt: -1 });
};

// Static method to get pending group invitations for user
groupSchema.statics.getPendingInvitations = function(email) {
  return this.find({
    'invitations.email': email.toLowerCase(),
    'invitations.status': 'pending',
    'invitations.expiresAt': { $gt: new Date() }
  })
    .populate('leader', 'name email')
}; 

const Group = mongoose.Model('Group', groupSchema);

module.exports = Group;