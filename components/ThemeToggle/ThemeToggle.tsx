'use client'

import { useTheme } from '@/context/ThemeContext'
import styles from './ThemeToggle.module.scss'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      className={styles.toggle}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      <span className={styles.icon}>{theme === 'light' ? '🌙' : '☀️'}</span>
      <span className={styles.text}>{theme === 'light' ? 'Dark' : 'Light'}</span>
    </button>
  )
}

