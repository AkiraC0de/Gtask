import mongoose, { mongo } from "mongoose"

export const COLUMN_LOCATION = {
  PLANNING: "todo",
  PLAN: "planning",
  ONGOING: "ongoing",
  DONE: "done",
} as const

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    maxlength: 100,
    required: true,
  },
  description: {
    type: String,
    maxlength: 300
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: true,
  },
  columnLocation : {
    type: String,
    enum: Object.keys(COLUMN_LOCATION)
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  deadline: {
    type: Date,
    required: true
  },
}, {
  timestamps: true
})

export type Task = mongoose.InferSchemaType<typeof taskSchema>

const TaskModel = mongoose.model("Task", taskSchema)
export default TaskModel