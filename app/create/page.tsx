'use client'

import { Suspense, lazy } from 'react'
import { ThemeToggle } from '@/components/ThemeToggle/ThemeToggle'
import Link from 'next/link'
import styles from './page.module.scss'

const TaskForm = lazy(() =>
  import('@/components/TaskForm/TaskForm').then((mod) => ({
    default: mod.TaskForm,
  }))
)

export default function CreateTaskPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>
          ← Back to Tasks
        </Link>
        <ThemeToggle />
      </header>
      <div className={styles.content}>
        <h1 className={styles.title}>Create New Task</h1>
        <Suspense fallback={<div className={styles.loading}>Loading form...</div>}>
          <TaskForm />
        </Suspense>
      </div>
    </div>
  )
}

