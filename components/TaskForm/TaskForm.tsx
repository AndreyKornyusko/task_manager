'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { ThemeProvider } from '@mui/material/styles'
import dayjs, { type Dayjs } from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import type { Task, TaskFormData, Priority } from '@/types/task'
import { useTasks } from '@/context/TaskContext'
import { validateTaskForm, hasValidationErrors } from '@/utils/validation'
import { datePickerTheme } from '@/lib/datePickerTheme'
import styles from './TaskForm.module.scss'

// Extend dayjs with timezone support
dayjs.extend(utc)
dayjs.extend(timezone)

interface TaskFormProps {
  task?: Task
  onSuccess?: () => void
}

export function TaskForm({ task, onSuccess }: TaskFormProps) {
  const router = useRouter()
  const { createTask, updateTask } = useTasks()
  const [formData, setFormData] = useState<TaskFormData>({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
  } as TaskFormData)
  const [dueDateValue, setDueDateValue] = useState<Dayjs | null>(
    task?.dueDate ? dayjs(task.dueDate) : null
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)

  // Update form data when task prop changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      } as TaskFormData)
      setDueDateValue(task.dueDate ? dayjs(task.dueDate) : null)
    }
  }, [task])

  // Get user's timezone
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  
  // Get today's date in user's timezone (start of day)
  const getTodayInTimezone = (): Dayjs => {
    const now = new Date()
    const todayStr = now.toLocaleString('en-US', {
      timeZone: userTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    const [month, day, year] = todayStr.split('/')
    return dayjs(`${year}-${month}-${day}`).tz(userTimezone).startOf('day')
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
    // Re-validate on change if form was already attempted to submit
    if (attemptedSubmit) {
      const validationErrors = validateTaskForm({ ...formData, [name]: value })
      const fieldError = validationErrors[name as keyof typeof validationErrors]
      if (fieldError) {
        setErrors((prev) => ({ ...prev, [name]: fieldError }))
      }
    }
  }

  const handleDateChange = (newValue: Dayjs | null) => {
    setDueDateValue(newValue)
    if (newValue) {
      // Format date as YYYY-MM-DD in user's timezone
      const dateStr = newValue.tz(userTimezone).format('YYYY-MM-DD')
      setFormData((prev) => ({ ...prev, dueDate: dateStr }))
      // Clear error when date is selected
      if (errors.dueDate) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.dueDate
          return newErrors
        })
      }
      // Re-validate on change if form was already attempted to submit
      if (attemptedSubmit) {
        const dateStr = newValue.tz(userTimezone).format('YYYY-MM-DD')
        const validationErrors = validateTaskForm({ ...formData, dueDate: dateStr })
        if (validationErrors.dueDate) {
          setErrors((prev) => ({ ...prev, dueDate: validationErrors.dueDate as string }))
        }
      }
    } else {
      setFormData((prev) => ({ ...prev, dueDate: '' }))
      // Re-validate on clear if form was already attempted to submit
      if (attemptedSubmit) {
        const validationErrors = validateTaskForm({ ...formData, dueDate: '' })
        if (validationErrors.dueDate) {
          setErrors((prev) => ({ ...prev, dueDate: validationErrors.dueDate as string }))
        }
      }
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    // Get current form values directly from state
    const currentTitle = String(formData.title || '').trim()
    const currentDescription = String(formData.description || '').trim()
    const currentPriority = (formData.priority || '') as Priority
    const currentDueDate = String(formData.dueDate || '')
    
    // Validate all fields
    const dataToValidate: TaskFormData = {
      title: currentTitle,
      description: currentDescription,
      priority: currentPriority,
      dueDate: currentDueDate,
    }
    
    // Run validation
    const validationErrors = validateTaskForm(dataToValidate)
    
    // Build error record
    const errorRecord: Record<string, string> = {}
    if (validationErrors.title) {
      errorRecord.title = validationErrors.title
    }
    if (validationErrors.description) {
      errorRecord.description = validationErrors.description
    }
    if (validationErrors.priority) {
      errorRecord.priority = validationErrors.priority
    }
    if (validationErrors.dueDate) {
      errorRecord.dueDate = validationErrors.dueDate
    }
    
    // Set errors state FIRST to trigger re-render
    setErrors(errorRecord)
    setAttemptedSubmit(true)
    
    // If there are validation errors, stop here
    if (Object.keys(errorRecord).length > 0) {
      // Scroll to first error field after state update
      setTimeout(() => {
        const firstErrorField = Object.keys(errorRecord)[0]
        if (firstErrorField) {
          const element = document.getElementById(firstErrorField)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
            element.focus()
          }
        }
      }, 100)
      return
    }

    setIsSubmitting(true)
    try {
      if (task) {
        await updateTask(task.id, formData)
      } else {
        await createTask(formData)
      }
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/')
      }
      // Reset attempted submit on success
      setAttemptedSubmit(false)
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to save task',
      } as Record<string, string>)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ThemeProvider theme={datePickerTheme}>
        <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="title" className={styles.label}>
          Title <span className={styles.required}>*</span>
        </label>
        <div className={errors.title ? `${styles.inputWrapper} ${styles.inputWrapperError}` : styles.inputWrapper}>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={styles.input}
            placeholder="Enter task title"
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? 'title-error' : undefined}
          />
        </div>
        {errors.title && (
          <span id="title-error" className={styles.error} role="alert">
            {errors.title}
          </span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="description" className={styles.label}>
          Description <span className={styles.required}>*</span>
        </label>
        <div className={errors.description ? `${styles.inputWrapper} ${styles.inputWrapperError}` : styles.inputWrapper}>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={styles.textarea}
            placeholder="Enter task description"
            rows={4}
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? 'description-error' : undefined}
          />
        </div>
        {errors.description && (
          <span id="description-error" className={styles.error} role="alert">
            {errors.description}
          </span>
        )}
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="priority" className={styles.label}>
            Priority <span className={styles.required}>*</span>
          </label>
          <div className={errors.priority ? `${styles.inputWrapper} ${styles.inputWrapperError}` : styles.inputWrapper}>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className={styles.select}
              aria-invalid={!!errors.priority}
              aria-describedby={errors.priority ? 'priority-error' : undefined}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          {errors.priority && (
            <span id="priority-error" className={styles.error} role="alert">
              {errors.priority}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="dueDate" className={styles.label}>
            Due Date <span className={styles.required}>*</span>
          </label>
          <DatePicker
            label=""
            value={dueDateValue}
            onChange={handleDateChange}
            minDate={getTodayInTimezone()}
            disablePast
            slotProps={{
              textField: {
                id: 'dueDate',
                required: true,
                error: !!errors.dueDate,
                helperText: errors.dueDate,
                fullWidth: true,
                'aria-invalid': !!errors.dueDate,
                'aria-describedby': errors.dueDate ? 'dueDate-error' : undefined,
                'aria-required': true,
              },
            }}
            sx={{
              width: '100%',
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                '& fieldset': {
                  borderColor: errors.dueDate ? 'var(--error)' : 'var(--border-color)',
                },
                '&:hover fieldset': {
                  borderColor: errors.dueDate ? 'var(--error)' : 'var(--accent-primary)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: errors.dueDate ? 'var(--error)' : 'var(--accent-primary)',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'var(--text-secondary)',
                '&.Mui-focused': {
                  color: 'var(--accent-primary)',
                },
                '&.Mui-error': {
                  color: 'var(--error)',
                },
              },
              '& .MuiFormHelperText-root': {
                color: 'var(--error)',
                marginLeft: 0,
              },
              '& .MuiInputAdornment-root': {
                '& .MuiIconButton-root': {
                  color: 'var(--text-secondary)',
                  '&:hover': {
                    color: 'var(--accent-primary)',
                    backgroundColor: 'var(--bg-tertiary)',
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'var(--text-secondary)',
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {errors.submit && (
        <div className={styles.submitError} role="alert">
          {errors.submit}
        </div>
      )}

      <div className={styles.actions}>
        <button
          type="button"
          onClick={() => router.back()}
          className={styles.cancelButton}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
      </ThemeProvider>
    </LocalizationProvider>
  )
}

