import type { TaskFormData } from '@/types/task'

export interface ValidationErrors {
  title?: string
  description?: string
  priority?: string
  dueDate?: string
}

export function validateTaskForm(data: TaskFormData): ValidationErrors {
  const errors: ValidationErrors = {}

  // Title validation
  if (!data.title || data.title.trim().length === 0) {
    errors.title = 'Title is required'
  } else if (data.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters long'
  }

  // Description validation
  if (!data.description || data.description.trim().length === 0) {
    errors.description = 'Description is required'
  }

  // Priority validation
  if (!data.priority) {
    errors.priority = 'Priority is required'
  }

  // Due date validation (timezone-aware)
  if (!data.dueDate) {
    errors.dueDate = 'Due date is required'
  } else {
    // Get user's timezone
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    
    // Create date in user's timezone
    const dueDateStr = data.dueDate.includes('T') ? data.dueDate : `${data.dueDate}T00:00:00`
    const dueDate = new Date(dueDateStr)
    
    // Get today's date in user's timezone (start of day)
    const now = new Date()
    const today = new Date(
      now.toLocaleString('en-US', { timeZone: userTimezone })
    )
    today.setHours(0, 0, 0, 0)
    
    // Convert due date to user's timezone for comparison
    const dueDateInTz = new Date(
      dueDate.toLocaleString('en-US', { timeZone: userTimezone })
    )
    dueDateInTz.setHours(0, 0, 0, 0)

    if (dueDateInTz < today) {
      errors.dueDate = 'Due date cannot be in the past'
    }
  }

  return errors
}

export function hasValidationErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0
}

