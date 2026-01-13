import mongoose, { Schema, Document } from 'mongoose'
import type { Task, Priority, TaskStatus } from '@/types/task'

export interface TaskDocument extends Omit<Task, 'id' | 'subtasks' | 'createdAt'>, Document {
  _id: mongoose.Types.ObjectId
  createdAt: Date
}

const TaskSchema = new Schema<TaskDocument>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'] as Priority[],
      required: true,
    },
    dueDate: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'done'] as TaskStatus[],
      required: true,
      default: 'todo',
    },
    completed: {
      type: Boolean,
      required: true,
      default: false,
    },
    createdAt: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
  },
  {
    timestamps: false,
  }
)

// Transform _id to id in JSON output
TaskSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    if (ret._id) {
      ret.id = ret._id.toString()
      delete ret._id
    }
    delete ret.__v
    return ret
  },
})

const TaskModel = mongoose.models.Task || mongoose.model<TaskDocument>('Task', TaskSchema)

export default TaskModel

