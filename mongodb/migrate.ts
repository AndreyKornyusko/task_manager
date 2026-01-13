import mongoose from 'mongoose'
import TaskModel from '@/models/Task'
import SubtaskModel from '@/models/Subtask'
import * as fs from 'fs'
import * as path from 'path'
import type { Task } from '@/types/task'

let migrationExecuted = false

export async function migrateDataFromJson(): Promise<void> {
  if (migrationExecuted) {
    return
  }

  try {
    // Check MongoDB connection (1 = connected)
    const readyState = mongoose.connection.readyState
    
    if (readyState !== 1) {
      // Wait up to 5 seconds for connection
      for (let i = 0; i < 5; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const newReadyState = mongoose.connection.readyState
        if (newReadyState === 1) {
          break
        }
        if (i === 4) {
          migrationExecuted = true
          return
        }
      }
    }

    // Check if data already exists
    const existingTasksCount = await TaskModel.countDocuments()
    if (existingTasksCount > 0) {
      migrationExecuted = true
      return
    }

    // Read db.json file
    const dbJsonPath = path.join(process.cwd(), 'db.json')
    if (!fs.existsSync(dbJsonPath)) {
      migrationExecuted = true
      return
    }

    const dbJsonContent = fs.readFileSync(dbJsonPath, 'utf-8')
    const initialData: { tasks: Task[]; subtasks: Array<{ id: string; title: string; completed: boolean; taskId: string }> } =
      JSON.parse(dbJsonContent)

    if (!initialData.tasks || initialData.tasks.length === 0) {
      migrationExecuted = true
      return
    }

    // Migrate tasks
    const tasksToInsert = initialData.tasks.map((task: Task) => ({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate,
      status: task.status,
      completed: task.completed,
      createdAt: new Date(task.createdAt),
    }))

    const insertedTasks = await TaskModel.insertMany(tasksToInsert)

    // Create a map of old IDs to new MongoDB IDs
    const idMap = new Map<string, string>()
    initialData.tasks.forEach((task: Task, index: number) => {
      if (insertedTasks[index] && insertedTasks[index]._id) {
        idMap.set(task.id, insertedTasks[index]._id.toString())
      }
    })

    // Migrate subtasks if any
    if (initialData.subtasks && initialData.subtasks.length > 0) {
      const subtasksToInsert = initialData.subtasks
        .map((subtask) => {
          const newTaskId = idMap.get(subtask.taskId)
          if (!newTaskId) {
            return null
          }
          return {
            title: subtask.title,
            completed: subtask.completed,
            taskId: newTaskId,
          }
        })
        .filter((subtask) => subtask !== null) as Array<{
        title: string
        completed: boolean
        taskId: string
      }>

      if (subtasksToInsert.length > 0) {
        await SubtaskModel.insertMany(subtasksToInsert)
      }
    }

    migrationExecuted = true
  } catch (error) {
    // Don't throw - allow app to continue even if migration fails
    migrationExecuted = true
  }
}

