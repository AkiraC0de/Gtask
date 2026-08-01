import mongoose from "mongoose"

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
  leaderUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [memberSchema]
  ,
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

export type Group = mongoose.InferSchemaType<typeof groupSchema>

const GroupModel = mongoose.model("Group", groupSchema);
export default GroupModel