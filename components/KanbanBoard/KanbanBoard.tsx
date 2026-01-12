'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { memo } from 'react'
import type { Task, TaskStatus } from '@/types/task'
import { useTasks } from '@/context/TaskContext'
import { KanbanColumn } from './KanbanColumn'
import { KanbanTaskCard } from './KanbanTaskCard'
import styles from './KanbanBoard.module.scss'

interface KanbanBoardProps {
  tasks: Task[]
}

function KanbanBoardComponent({ tasks }: KanbanBoardProps) {
  const { updateTask } = useTasks()
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const columns: { id: TaskStatus; title: string }[] = [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'done', title: 'Done' },
  ]

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status)
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const taskId = active.id as string
    const newStatus = over.id as TaskStatus

    const task = tasks.find((t) => t.id === taskId)
    if (!task || task.status === newStatus) return

    // Update task status
    await updateTask(taskId, {
      status: newStatus,
      completed: newStatus === 'done',
    })
  }

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.board}>
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            tasks={getTasksByStatus(column.id)}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? (
          <div className={styles.dragOverlay}>
            <KanbanTaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export const KanbanBoard = memo(KanbanBoardComponent)

