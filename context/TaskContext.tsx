'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Task, Subtask, TaskFormData } from '@/types/task'
import { taskAPI, subtaskAPI } from '@/lib/api'

interface TaskContextType {
  tasks: Task[]
  loading: boolean
  error: string | null
  fetchTasks: () => Promise<void>
  createTask: (data: TaskFormData) => Promise<Task>
  updateTask: (id: string, data: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  toggleTaskCompletion: (id: string) => Promise<void>
  createSubtask: (taskId: string, title: string) => Promise<Subtask>
  updateSubtask: (id: string, data: Partial<Subtask>) => Promise<void>
  deleteSubtask: (id: string) => Promise<void>
  toggleSubtaskCompletion: (id: string) => Promise<void>
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const fetchedTasks = await taskAPI.getAll()
      // Fetch subtasks for each task
      const tasksWithSubtasks = await Promise.all(
        fetchedTasks.map(async (task) => {
          try {
            const subtasks = await subtaskAPI.getByTaskId(task.id)
            return { ...task, subtasks }
          } catch {
            return { ...task, subtasks: [] }
          }
        })
      )
      setTasks(tasksWithSubtasks)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const createTask = useCallback(async (data: TaskFormData): Promise<Task> => {
    setError(null)
    try {
      const newTask = await taskAPI.create(data)
      setTasks((prev) => [...prev, { ...newTask, subtasks: [] }])
      return newTask
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task'
      setError(errorMessage)
      throw err
    }
  }, [])

  const updateTask = useCallback(async (id: string, data: Partial<Task>): Promise<void> => {
    setError(null)
    try {
      const updatedTask = await taskAPI.update(id, data)
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? { ...updatedTask, subtasks: task.subtasks } : task))
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task'
      setError(errorMessage)
      throw err
    }
  }, [])

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    setError(null)
    try {
      await taskAPI.delete(id)
      setTasks((prev) => prev.filter((task) => task.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task'
      setError(errorMessage)
      throw err
    }
  }, [])

  const toggleTaskCompletion = useCallback(
    async (id: string): Promise<void> => {
      const task = tasks.find((t) => t.id === id)
      if (!task) return

      const newCompleted = !task.completed
      const newStatus = newCompleted ? 'done' : 'todo'

      await updateTask(id, {
        completed: newCompleted,
        status: newStatus,
      })
    },
    [tasks, updateTask]
  )

  const createSubtask = useCallback(
    async (taskId: string, title: string): Promise<Subtask> => {
      setError(null)
      try {
        const newSubtask = await subtaskAPI.create(taskId, title)
        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId
              ? { ...task, subtasks: [...task.subtasks, newSubtask] }
              : task
          )
        )
        return newSubtask
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create subtask'
        setError(errorMessage)
        throw err
      }
    },
    []
  )

  const updateSubtask = useCallback(async (id: string, data: Partial<Subtask>): Promise<void> => {
    setError(null)
    try {
      await subtaskAPI.update(id, data)
      setTasks((prev) =>
        prev.map((task) => ({
          ...task,
          subtasks: task.subtasks.map((subtask) =>
            subtask.id === id ? { ...subtask, ...data } : subtask
          ),
        }))
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update subtask'
      setError(errorMessage)
      throw err
    }
  }, [])

  const deleteSubtask = useCallback(async (id: string): Promise<void> => {
    setError(null)
    try {
      await subtaskAPI.delete(id)
      setTasks((prev) =>
        prev.map((task) => ({
          ...task,
          subtasks: task.subtasks.filter((subtask) => subtask.id !== id),
        }))
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete subtask'
      setError(errorMessage)
      throw err
    }
  }, [])

  const toggleSubtaskCompletion = useCallback(
    async (id: string): Promise<void> => {
      const task = tasks.find((t) => t.subtasks.some((s) => s.id === id))
      const subtask = task?.subtasks.find((s) => s.id === id)
      if (!subtask) return

      await updateSubtask(id, { completed: !subtask.completed })
    },
    [tasks, updateSubtask]
  )

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        createSubtask,
        updateSubtask,
        deleteSubtask,
        toggleSubtaskCompletion,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTasks() {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider')
  }
  return context
}

