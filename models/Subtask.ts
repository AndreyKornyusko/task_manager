import mongoose, { Schema, Document } from 'mongoose'
import type { Subtask } from '@/types/task'

export interface SubtaskDocument extends Omit<Subtask, 'id' | 'taskId'>, Document {
  _id: mongoose.Types.ObjectId
  taskId: mongoose.Types.ObjectId
}

const SubtaskSchema = new Schema<SubtaskDocument>(
  {
    title: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      required: true,
      default: false,
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
  },
  {
    timestamps: false,
  }
)

// Transform _id to id in JSON output
SubtaskSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    if (ret._id) {
      ret.id = ret._id.toString()
      delete ret._id
    }
    delete ret.__v
    // Convert taskId ObjectId to string
    if (ret.taskId) {
      if (typeof ret.taskId === 'object' && ret.taskId !== null) {
        ret.taskId = ret.taskId.toString()
      } else {
        ret.taskId = String(ret.taskId)
      }
    }
    return ret
  },
})

const SubtaskModel = mongoose.models.Subtask || mongoose.model<SubtaskDocument>('Subtask', SubtaskSchema)

export default SubtaskModel

