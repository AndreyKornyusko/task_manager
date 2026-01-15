export type Priority = 'low' | 'medium' | 'high'

export type TaskStatus = 'todo' | 'in-progress' | 'done'

export interface Subtask {
  id: string
  title: string
  completed: boolean
  taskId: string
}

export interface Task {
  id: string
  title: string
  description: string
  priority: Priority
  dueDate: string // ISO date string
  status: TaskStatus
  completed: boolean
  createdAt: string // ISO date string
  subtasks: Subtask[]
}

export type FilterStatus = 'all' | 'completed' | 'incomplete'

export type FilterPriority = 'all' | Priority

export interface FilterOptions {
  status: FilterStatus
  priority: FilterPriority
}

export type SortField = 'createdAt' | 'dueDate' | 'priority'

export type SortOrder = 'asc' | 'desc'

export interface SortOptions {
  field: SortField
  order: SortOrder
}

export interface TaskFormData {
  title: string
  description: string
  priority: Priority
  dueDate: string
}



