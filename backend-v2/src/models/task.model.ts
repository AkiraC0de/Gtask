import mongoose from "mongoose"

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
    trim: true,
  },
  description: {
    type: String,
    maxlength: 300,
    trim: true,
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

taskSchema.index({ groupId: 1, columnLocation: 1 });
taskSchema.index({ groupId: 1, assignedTo: 1 });

export type Task = mongoose.InferSchemaType<typeof taskSchema>

const TaskModel = mongoose.model("Task", taskSchema)
export default TaskModel