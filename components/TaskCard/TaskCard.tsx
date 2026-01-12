'use client'

import { memo } from 'react'
import Link from 'next/link'
import type { Task } from '@/types/task'
import { useTasks } from '@/context/TaskContext'
import { formatDate, isPastDue, isDueToday, isDueSoon } from '@/utils/dateUtils'
import styles from './TaskCard.module.scss'

interface TaskCardProps {
  task: Task
}

function TaskCardComponent({ task }: TaskCardProps) {
  const { toggleTaskCompletion, deleteTask } = useTasks()

  const handleToggleComplete = async () => {
    await toggleTaskCompletion(task.id)
  }

  const handleDelete = async () => {
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
    <div className={`${styles.card} ${task.completed ? styles.completed : ''}`}>
      <div className={styles.header}>
        <div className={styles.checkboxContainer}>
          <input
            type="checkbox"
            checked={task.completed}
            onChange={handleToggleComplete}
            className={styles.checkbox}
            aria-label={`Mark task "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
          />
        </div>
        <Link href={`/task/${task.id}`} className={styles.titleLink}>
          <h3 className={styles.title}>{task.title}</h3>
        </Link>
        <div className={styles.actions}>
          <Link href={`/task/${task.id}`} className={styles.editButton} aria-label="Edit task">
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

      <p className={styles.description}>{task.description}</p>

      <div className={styles.footer}>
        <div className={styles.meta}>
          <span className={`${styles.priority} ${getPriorityClass()}`}>
            {task.priority}
          </span>
          <span className={`${styles.dueDate} ${getDueDateClass()}`}>
            Due: {formatDate(task.dueDate)}
          </span>
          {task.subtasks.length > 0 && (
            <span className={styles.subtasksCount}>
              {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} subtasks
            </span>
          )}
        </div>
        <span className={styles.status}>{task.status}</span>
      </div>
    </div>
  )
}

export const TaskCard = memo(TaskCardComponent)

