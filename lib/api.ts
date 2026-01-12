import type { Task, Subtask, TaskFormData } from '@/types/task'

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `API Error: ${response.statusText}`)
  }

  return response.json()
}

export const taskAPI = {
  // Get all tasks
  getAll: async (): Promise<Task[]> => {
    return fetchAPI<Task[]>('/tasks')
  },

  // Get single task
  getById: async (id: string): Promise<Task> => {
    return fetchAPI<Task>(`/tasks/${id}`)
  },

  // Create task
  create: async (data: TaskFormData): Promise<Task> => {
    const newTask: Omit<Task, 'id' | 'createdAt' | 'subtasks'> = {
      ...data,
      status: 'todo',
      completed: false,
    }

    return fetchAPI<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(newTask),
    })
  },

  // Update task
  update: async (id: string, data: Partial<Task>): Promise<Task> => {
    return fetchAPI<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // Delete task
  delete: async (id: string): Promise<void> => {
    await fetchAPI<void>(`/tasks/${id}`, {
      method: 'DELETE',
    })
  },
}

export const subtaskAPI = {
  // Get subtasks for a task
  getByTaskId: async (taskId: string): Promise<Subtask[]> => {
    return fetchAPI<Subtask[]>(`/subtasks?taskId=${taskId}`)
  },

  // Create subtask
  create: async (taskId: string, title: string): Promise<Subtask> => {
    return fetchAPI<Subtask>('/subtasks', {
      method: 'POST',
      body: JSON.stringify({
        title,
        completed: false,
        taskId,
      }),
    })
  },

  // Update subtask
  update: async (id: string, data: Partial<Subtask>): Promise<Subtask> => {
    return fetchAPI<Subtask>(`/subtasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // Delete subtask
  delete: async (id: string): Promise<void> => {
    await fetchAPI<void>(`/subtasks/${id}`, {
      method: 'DELETE',
    })
  },
}

