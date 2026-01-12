'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { memo } from 'react'
import type { Task } from '@/types/task'
import { KanbanTaskCard } from './KanbanTaskCard'
import styles from './KanbanBoard.module.scss'

interface DraggableTaskCardProps {
  task: Task
}

function DraggableTaskCardComponent({ task }: DraggableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: task.id,
    data: {
      type: 'card',
      task,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={isDragging ? styles.dragging : ''}
    >
      <KanbanTaskCard task={task} />
    </div>
  )
}

export const DraggableTaskCard = memo(DraggableTaskCardComponent)

