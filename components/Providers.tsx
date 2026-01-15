'use client'

import { TaskProvider } from '@/context/TaskContext'
import { ThemeProvider } from '@/context/ThemeContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <TaskProvider>{children}</TaskProvider>
    </ThemeProvider>
  )
}



