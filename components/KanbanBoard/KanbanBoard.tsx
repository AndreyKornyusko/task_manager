'use client'

import { useState, useEffect, useRef } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  TouchSensor,
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

type ActiveDrag = {
  id: string
  task: Task
}

// Helper to check if columns structure changed
function columnsEqual(
  a: Record<TaskStatus, Task[]>,
  b: Record<TaskStatus, Task[]>
): boolean {
  const statuses: TaskStatus[] = ['todo', 'in-progress', 'done']
  for (const status of statuses) {
    const aTasks = a[status] ?? []
    const bTasks = b[status] ?? []
    if (aTasks.length !== bTasks.length) return false
    for (let i = 0; i < aTasks.length; i++) {
      if (aTasks[i]?.id !== bTasks[i]?.id || aTasks[i]?.status !== bTasks[i]?.status) {
        return false
      }
    }
  }
  return true
}

function KanbanBoardComponent({ tasks }: KanbanBoardProps) {
  const { updateTask } = useTasks()
  const [localColumns, setLocalColumns] = useState<Record<TaskStatus, Task[]>>(() => {
    const initialColumns: Record<TaskStatus, Task[]> = {
      todo: [],
      'in-progress': [],
      done: [],
    }
    tasks.forEach((task) => {
      const status = task.status as TaskStatus
      if (initialColumns[status]) {
        initialColumns[status].push(task)
      }
    })
    return initialColumns
  })
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null)
  const prevTasksRef = useRef<Task[]>(tasks)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  )

  const columns: { id: TaskStatus; title: string }[] = [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'done', title: 'Done' },
  ]

  // Compute columns from tasks
  const computeColumns = (taskList: Task[]): Record<TaskStatus, Task[]> => {
    const newColumns: Record<TaskStatus, Task[]> = {
      todo: [],
      'in-progress': [],
      done: [],
    }

    taskList.forEach((task) => {
      const status = task.status as TaskStatus
      if (newColumns[status]) {
        newColumns[status].push(task)
      }
    })

    return newColumns
  }

  // Sync from parent only when content truly changed (avoid wiping optimistic UI)
  useEffect(() => {
    // Don't sync during active drag
    if (activeDrag) {
      return
    }

    // Check if tasks actually changed by comparing with previous ref
    const prevTasks = prevTasksRef.current
    if (!prevTasks || prevTasks.length === 0) {
      // Initial sync
      const computedColumns = computeColumns(tasks)
      setLocalColumns(computedColumns)
      prevTasksRef.current = [...tasks]
      return
    }

    const tasksChanged =
      prevTasks.length !== tasks.length ||
      prevTasks.some((prevTask, idx) => {
        const currentTask = tasks[idx]
        return (
          !currentTask ||
          prevTask.id !== currentTask.id ||
          prevTask.status !== currentTask.status
        )
      })

    if (tasksChanged) {
      const computedColumns = computeColumns(tasks)
      // Only update if structure actually changed
      setLocalColumns((prev) => {
        if (columnsEqual(prev, computedColumns)) {
          return prev
        }
        return computedColumns
      })
      // Update ref with new tasks array
      prevTasksRef.current = [...tasks]
    }
  }, [tasks, activeDrag])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveDrag(null)

    if (!over) {
      return
    }

    const activeData = active.data.current as { type: 'card'; task: Task } | undefined
    const overData = over.data.current as
      | { type: 'column'; status: TaskStatus }
      | { type: 'card'; task: Task }
      | undefined

    // Get the task being dragged
    if (!activeData || activeData.type !== 'card') {
      return
    }

    const { task } = activeData

    // Determine target status - prioritize column data, then check over.id
    let targetStatus: TaskStatus | undefined
    const columnIds: TaskStatus[] = ['todo', 'in-progress', 'done']

    // First, check if dropped on column (via data.current)
    if (overData?.type === 'column') {
      targetStatus = overData.status
    }
    // Second, check if over.id is a column status (fallback for when data.current is not set)
    else if (columnIds.includes(over.id as TaskStatus)) {
      targetStatus = over.id as TaskStatus
    }
    // Third, check if dropped on another card - use that card's status
    else if (overData?.type === 'card') {
      targetStatus = overData.task.status as TaskStatus
    }
    // Last resort: try to find the task in localColumns to get its column
    else {
      for (const status of columnIds) {
        const found = localColumns[status]?.find((t) => t.id === over.id)
        if (found) {
          targetStatus = found.status as TaskStatus
          break
        }
      }
    }

    // If still no target or same status, return early
    if (!targetStatus || task.status === targetStatus) {
      return
    }

    // Optimistic local move between columns
    const fromStatus = task.status as TaskStatus
    const toStatus = targetStatus

    setLocalColumns((prev) => {
      const source = [...(prev[fromStatus] ?? [])]
      const index = source.findIndex((item) => item.id === task.id)
      if (index === -1) {
        return prev
      }

      const [moved] = source.splice(index, 1)
      if (!moved) {
        return prev
      }
      const updatedMoved: Task = { ...moved, status: toStatus, completed: toStatus === 'done' }
      const targetList = [...(prev[toStatus] ?? []), updatedMoved]

      return {
        ...prev,
        [fromStatus]: source,
        [toStatus]: targetList,
      }
    })

    // Update task on server (fire and forget, like in the working example)
    updateTask(task.id, {
      status: toStatus,
      completed: toStatus === 'done',
    }).catch(() => {
      // Rollback to server state on error
      setLocalColumns((prev) => {
        const rollbackColumns = computeColumns(tasks)
        return rollbackColumns
      })
    })
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={(event) => {
        const data = event.active.data.current as { type: 'card'; task: Task } | undefined
        if (data?.type === 'card') {
          setActiveDrag({ id: event.active.id.toString(), task: data.task })
        }
      }}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveDrag(null)}
    >
      <div className={styles.board}>
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            tasks={localColumns[column.id] ?? []}
          />
        ))}
      </div>
      <DragOverlay>
        {activeDrag ? (
          <div className={styles.dragOverlay}>
            <KanbanTaskCard task={activeDrag.task} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export const KanbanBoard = memo(KanbanBoardComponent)

