import connectDB from '@/mongodb/client'
import SubtaskModel from '@/models/Subtask'
import type { Subtask } from '@/types/task'

async function getSubtasksByTaskId(taskId: string): Promise<Subtask[]> {
  await connectDB()

  const subtasks = await SubtaskModel.find({ taskId }).lean()

  return subtasks.map((subtask) => ({
    id: subtask._id.toString(),
    title: subtask.title,
    completed: subtask.completed,
    taskId: subtask.taskId.toString(),
  }))
}

async function getSubtaskById(id: string): Promise<Subtask | undefined> {
  await connectDB()

  const subtask = await SubtaskModel.findById(id).lean()
  if (!subtask) {
    return undefined
  }

  return {
    id: subtask._id.toString(),
    title: subtask.title,
    completed: subtask.completed,
    taskId: subtask.taskId.toString(),
  }
}

async function createSubtask(subtask: Omit<Subtask, 'id'>): Promise<Subtask> {
  await connectDB()

  const newSubtask = new SubtaskModel({
    title: subtask.title,
    completed: subtask.completed,
    taskId: subtask.taskId,
  })

  const savedSubtask = await newSubtask.save()

  return {
    id: savedSubtask._id.toString(),
    title: savedSubtask.title,
    completed: savedSubtask.completed,
    taskId: savedSubtask.taskId.toString(),
  }
}

async function updateSubtask(id: string, updates: Partial<Subtask>): Promise<Subtask | undefined> {
  await connectDB()

  const subtask = await SubtaskModel.findByIdAndUpdate(
    id,
    {
      ...(updates.title && { title: updates.title }),
      ...(updates.completed !== undefined && { completed: updates.completed }),
      ...(updates.taskId && { taskId: updates.taskId }),
    },
    { new: true }
  ).lean()

  if (!subtask) {
    return undefined
  }

  return {
    id: subtask._id.toString(),
    title: subtask.title,
    completed: subtask.completed,
    taskId: subtask.taskId.toString(),
  }
}

async function deleteSubtask(id: string): Promise<boolean> {
  await connectDB()

  const result = await SubtaskModel.findByIdAndDelete(id)
  return !!result
}

export const subtaskRepository = {
  getSubtasksByTaskId,
  getSubtaskById,
  createSubtask,
  updateSubtask,
  deleteSubtask,
}


