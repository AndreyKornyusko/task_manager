'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Task } from '@/types/task'
import { useTasks } from '@/context/TaskContext'
import { formatDate, formatDateTime, isPastDue, isDueToday } from '@/utils/dateUtils'
import styles from './TaskDetails.module.scss'

interface TaskDetailsProps {
  task: Task
}

export function TaskDetails({ task }: TaskDetailsProps) {
  const router = useRouter()
  const { deleteTask, toggleTaskCompletion } = useTasks()

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(task.id)
      router.push('/')
    }
  }

  const handleToggleComplete = async () => {
    await toggleTaskCompletion(task.id)
  }

  const getDueDateClass = () => {
    if (isPastDue(task.dueDate)) return styles.duePast
    if (isDueToday(task.dueDate)) return styles.dueToday
    return ''
  }

  const getPriorityClass = () => {
    return styles[`priority${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`]
  }

  return (
    <div className={styles.container}>
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
        <h1 className={styles.title}>{task.title}</h1>
        <div className={styles.actions}>
          <Link href={`/task/${task.id}/edit`} className={styles.editButton}>
            Edit
          </Link>
          <button onClick={handleDelete} className={styles.deleteButton}>
            Delete
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Description</h2>
          <p className={styles.description}>{task.description}</p>
        </div>

        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Priority:</span>
            <span className={`${styles.priority} ${getPriorityClass()}`}>
              {task.priority}
            </span>
          </div>

          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Status:</span>
            <span className={styles.status}>{task.status}</span>
          </div>

          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Due Date:</span>
            <span className={`${styles.dueDate} ${getDueDateClass()}`}>
              {formatDate(task.dueDate)}
            </span>
          </div>

          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Created:</span>
            <span className={styles.createdDate}>{formatDateTime(task.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <Link href="/" className={styles.backLink}>
          ← Back to Tasks
        </Link>
      </div>
    </div>
  )
}

