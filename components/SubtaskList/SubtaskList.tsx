'use client'

import { useState } from 'react'
import type { Task } from '@/types/task'
import { useTasks } from '@/context/TaskContext'
import styles from './SubtaskList.module.scss'

interface SubtaskListProps {
  task: Task
}

export function SubtaskList({ task }: SubtaskListProps) {
  const { createSubtask, toggleSubtaskCompletion, deleteSubtask } = useTasks()
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubtaskTitle.trim()) return

    setIsAdding(true)
    try {
      await createSubtask(task.id, newSubtaskTitle.trim())
      setNewSubtaskTitle('')
    } catch (error) {
      console.error('Failed to create subtask:', error)
    } finally {
      setIsAdding(false)
    }
  }

  const handleToggleSubtask = async (subtaskId: string) => {
    await toggleSubtaskCompletion(subtaskId)
  }

  const handleDeleteSubtask = async (subtaskId: string) => {
    if (confirm('Are you sure you want to delete this subtask?')) {
      await deleteSubtask(subtaskId)
    }
  }

  const completedCount = task.subtasks.filter((s) => s.completed).length
  const totalCount = task.subtasks.length
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Subtasks</h3>
        {totalCount > 0 && (
          <div className={styles.progress}>
            <span className={styles.progressText}>
              {completedCount} / {totalCount} completed
            </span>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleAddSubtask} className={styles.addForm}>
        <input
          type="text"
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          placeholder="Add a subtask..."
          className={styles.addInput}
          disabled={isAdding}
        />
        <button
          type="submit"
          className={styles.addButton}
          disabled={isAdding || !newSubtaskTitle.trim()}
        >
          {isAdding ? 'Adding...' : 'Add'}
        </button>
      </form>

      {task.subtasks.length > 0 && (
        <ul className={styles.list}>
          {task.subtasks.map((subtask) => (
            <li key={subtask.id} className={styles.item}>
              <div className={styles.subtaskContent}>
                <input
                  type="checkbox"
                  checked={subtask.completed}
                  onChange={() => handleToggleSubtask(subtask.id)}
                  className={styles.checkbox}
                  aria-label={`Mark subtask "${subtask.title}" as ${subtask.completed ? 'incomplete' : 'complete'}`}
                />
                <span
                  className={`${styles.subtaskTitle} ${subtask.completed ? styles.completed : ''}`}
                >
                  {subtask.title}
                </span>
              </div>
              <button
                onClick={() => handleDeleteSubtask(subtask.id)}
                className={styles.deleteButton}
                aria-label={`Delete subtask "${subtask.title}"`}
              >
                🗑️
              </button>
            </li>
          ))}
        </ul>
      )}

      {task.subtasks.length === 0 && (
        <p className={styles.empty}>No subtasks yet. Add one above to get started.</p>
      )}
    </div>
  )
}

