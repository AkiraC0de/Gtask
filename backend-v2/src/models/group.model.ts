import mongoose from "mongoose"

const GROUP_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  DELETED: "deleted"
}

const memberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  joinedAt: {
    type: Date,
    immutable: true,
    default: Date.now
  }
}, {
  _id: false
})

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    maxlength: 100,
    trim: true
  },
  leaderUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [memberSchema],
  status: {
    type: String,
    enum: Object.keys(GROUP_STATUS),
    default: GROUP_STATUS.ACTIVE
  },
  maxMember: {
    type: Number,
    min: 2,
    max: 20,
    default: 10, 
    required: true,
  }
}, {
  timestamps: true
})

groupSchema.index({leaderUserId: 1, status: 1})

export type Group = mongoose.InferSchemaType<typeof groupSchema>

const GroupModel = mongoose.model("Group", groupSchema);
export default GroupModel