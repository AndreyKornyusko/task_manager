'use client'

import { memo } from 'react'
import Link from 'next/link'
import type { Task } from '@/types/task'
import { useTasks } from '@/context/TaskContext'
import { formatDate, isPastDue, isDueToday, isDueSoon } from '@/utils/dateUtils'
import styles from './KanbanTaskCard.module.scss'

interface KanbanTaskCardProps {
  task: Task
}

function KanbanTaskCardComponent({ task }: KanbanTaskCardProps) {
  const { toggleTaskCompletion, deleteTask } = useTasks()

  const handleToggleComplete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await toggleTaskCompletion(task.id)
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(task.id)
    }
  }

  const getDueDateClass = () => {
    if (isPastDue(task.dueDate)) return styles.duePast
    if (isDueToday(task.dueDate)) return styles.dueToday
    if (isDueSoon(task.dueDate)) return styles.dueSoon
    return ''
  }

  const getPriorityClass = () => {
    return styles[`priority${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`]
  }

  return (
    <div className={`${styles.kanbanCard} ${task.completed ? styles.completed : ''}`}>
      <div className={styles.header}>
        <div className={styles.checkboxContainer}>
          <input
            type="checkbox"
            checked={task.completed}
            onChange={handleToggleComplete}
            onClick={handleToggleComplete}
            className={styles.checkbox}
            aria-label={`Mark task "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
          />
        </div>
        <Link href={`/task/${task.id}`} className={styles.titleLink}>
          <h3 className={styles.title}>{task.title}</h3>
        </Link>
        <div className={styles.actions}>
          <Link
            href={`/task/${task.id}`}
            className={styles.editButton}
            aria-label="Edit task"
            onClick={(e) => e.stopPropagation()}
          >
            ✏️
          </Link>
          <button
            onClick={handleDelete}
            className={styles.deleteButton}
            aria-label="Delete task"
          >
            🗑️
          </button>
        </div>
      </div>

      {task.description && (
        <p className={styles.description}>{task.description}</p>
      )}

      <div className={styles.footer}>
        <div className={styles.meta}>
          <span className={`${styles.priority} ${getPriorityClass()}`}>
            {task.priority}
          </span>
          <span className={`${styles.dueDate} ${getDueDateClass()}`}>
            {formatDate(task.dueDate)}
          </span>
          {task.subtasks.length > 0 && (
            <span className={styles.subtasksCount}>
              {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export const KanbanTaskCard = memo(KanbanTaskCardComponent)

