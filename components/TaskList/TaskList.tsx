'use client'

import { memo } from 'react'
import type { Task } from '@/types/task'
import { TaskCard } from '../TaskCard/TaskCard'
import styles from './TaskList.module.scss'

interface TaskListProps {
  tasks: Task[]
}

function TaskListComponent({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>No tasks found</p>
        <p className={styles.emptySubtext}>Create a new task to get started</p>
      </div>
    )
  }

  return (
    <div className={styles.list}>
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  )
}

export const TaskList = memo(TaskListComponent)

