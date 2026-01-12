'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { memo } from 'react'
import type { Task, TaskStatus } from '@/types/task'
import { DraggableTaskCard } from './DraggableTaskCard'
import styles from './KanbanBoard.module.scss'

interface KanbanColumnProps {
  id: TaskStatus
  title: string
  tasks: Task[]
}

function KanbanColumnComponent({ id, title, tasks }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  const taskIds = tasks.map((task) => task.id)

  const getColumnClass = () => {
    const baseClass = styles.column
    const overClass = isOver ? styles.columnOver : ''
    // Convert 'in-progress' to 'InProgress', 'todo' to 'Todo', 'done' to 'Done'
    const statusClassKey = id
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('')
    const statusClass = styles[`column${statusClassKey}`] || ''
    return `${baseClass} ${overClass} ${statusClass}`.trim()
  }

  return (
    <div ref={setNodeRef} className={getColumnClass()}>
      <div className={styles.columnHeader}>
        <h3 className={styles.columnTitle}>{title}</h3>
        <span className={styles.columnCount}>{tasks.length}</span>
      </div>
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className={styles.columnContent}>
          {tasks.map((task) => (
            <DraggableTaskCard key={task.id} task={task} />
          ))}
          {tasks.length === 0 && (
            <div className={styles.emptyColumn}>Drop tasks here</div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

export const KanbanColumn = memo(KanbanColumnComponent)

