'use client'

import { useEffect, Suspense, lazy } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTasks } from '@/context/TaskContext'
import { SubtaskList } from '@/components/SubtaskList/SubtaskList'
import { ThemeToggle } from '@/components/ThemeToggle/ThemeToggle'
import styles from './page.module.scss'

const TaskDetails = lazy(() =>
  import('@/components/TaskDetails/TaskDetails').then((mod) => ({
    default: mod.TaskDetails,
  }))
)

export default function TaskDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { tasks, loading } = useTasks()
  const taskId = params.id as string

  const task = tasks.find((t) => t.id === taskId)

  useEffect(() => {
    if (!loading && !task && taskId) {
      router.push('/')
    }
  }, [loading, task, taskId, router])

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading task...</div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Task not found</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <ThemeToggle />
      </header>
      <div className={styles.content}>
        <Suspense fallback={<div className={styles.loading}>Loading task details...</div>}>
          <TaskDetails task={task} />
        </Suspense>
        <SubtaskList task={task} />
      </div>
    </div>
  )
}

