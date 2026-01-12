'use client'

import { useEffect, Suspense, lazy } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTasks } from '@/context/TaskContext'
import { ThemeToggle } from '@/components/ThemeToggle/ThemeToggle'
import styles from './page.module.scss'

const TaskForm = lazy(() =>
  import('@/components/TaskForm/TaskForm').then((mod) => ({
    default: mod.TaskForm,
  }))
)

export default function EditTaskPage() {
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

  const handleSuccess = () => {
    router.push(`/task/${taskId}`)
  }

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
        <h1 className={styles.title}>Edit Task</h1>
        <Suspense fallback={<div className={styles.loading}>Loading form...</div>}>
          <TaskForm task={task} onSuccess={handleSuccess} />
        </Suspense>
      </div>
    </div>
  )
}

