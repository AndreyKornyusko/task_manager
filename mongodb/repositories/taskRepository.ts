import connectDB from '@/mongodb/client'
import TaskModel from '@/models/Task'
import SubtaskModel from '@/models/Subtask'
import type { Task } from '@/types/task'

async function getAllTasks(): Promise<Task[]> {
  await connectDB()

  const tasks = await TaskModel.find({}).lean()
  const tasksWithSubtasks = await Promise.all(
    tasks.map(async (task) => {
      const subtasks = await SubtaskModel.find({ taskId: task._id }).lean()
      return {
        ...task,
        id: task._id.toString(),
        createdAt: task.createdAt instanceof Date ? task.createdAt.toISOString() : task.createdAt,
        subtasks: subtasks.map((subtask) => ({
          id: subtask._id.toString(),
          title: subtask.title,
          completed: subtask.completed,
          taskId: subtask.taskId.toString(),
        })),
      } as Task
    })
  )

  return tasksWithSubtasks
}

async function getTaskById(id: string): Promise<Task | undefined> {
  await connectDB()

  const task = await TaskModel.findById(id).lean()
  if (!task) {
    return undefined
  }

  const subtasks = await SubtaskModel.find({ taskId: task._id }).lean()

  return {
    ...task,
    id: task._id.toString(),
    createdAt: task.createdAt instanceof Date ? task.createdAt.toISOString() : task.createdAt,
    subtasks: subtasks.map((subtask) => ({
      id: subtask._id.toString(),
      title: subtask.title,
      completed: subtask.completed,
      taskId: subtask.taskId.toString(),
    })),
  } as Task
}

async function createTask(task: Omit<Task, 'id' | 'createdAt' | 'subtasks'>): Promise<Task> {
  await connectDB()

  const newTask = new TaskModel({
    title: task.title,
    description: task.description,
    priority: task.priority,
    dueDate: task.dueDate,
    status: task.status,
    completed: task.completed,
    createdAt: new Date(),
  })

  const savedTask = await newTask.save()

  return {
    ...savedTask.toJSON(),
    id: savedTask._id.toString(),
    createdAt: savedTask.createdAt instanceof Date ? savedTask.createdAt.toISOString() : savedTask.createdAt,
    subtasks: [],
  } as Task
}

async function updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
  await connectDB()

  const task = await TaskModel.findByIdAndUpdate(
    id,
    {
      ...(updates.title && { title: updates.title }),
      ...(updates.description && { description: updates.description }),
      ...(updates.priority && { priority: updates.priority }),
      ...(updates.dueDate && { dueDate: updates.dueDate }),
      ...(updates.status !== undefined && { status: updates.status }),
      ...(updates.completed !== undefined && { completed: updates.completed }),
    },
    { new: true }
  ).lean()

  if (!task) {
    return undefined
  }

  const subtasks = await SubtaskModel.find({ taskId: task._id }).lean()

  return {
    ...task,
    id: task._id.toString(),
    createdAt: task.createdAt instanceof Date ? task.createdAt.toISOString() : task.createdAt,
    subtasks: subtasks.map((subtask) => ({
      id: subtask._id.toString(),
      title: subtask.title,
      completed: subtask.completed,
      taskId: subtask.taskId.toString(),
    })),
  } as Task
}

async function deleteTask(id: string): Promise<boolean> {
  await connectDB()

  const result = await TaskModel.findByIdAndDelete(id)
  if (!result) {
    return false
  }

  // Also delete associated subtasks
  await SubtaskModel.deleteMany({ taskId: id })

  return true
}

export const taskRepository = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
}

