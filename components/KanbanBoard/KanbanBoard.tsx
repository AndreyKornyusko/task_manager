'use client'

import { useState, useEffect } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
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

type ActiveDrag = {
  id: string
  task: Task
}

function KanbanBoardComponent({ tasks }: KanbanBoardProps) {
  const { updateTask } = useTasks()
  const [localColumns, setLocalColumns] = useState<Record<TaskStatus, Task[]>>({
    todo: [],
    'in-progress': [],
    done: [],
  })
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null)

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

  // Sync local columns with tasks prop
  // Only sync when tasks change from server, not during optimistic updates
  useEffect(() => {
    // Don't sync during active drag
    if (activeDrag) {
      return
    }

    const newColumns: Record<TaskStatus, Task[]> = {
      todo: [],
      'in-progress': [],
      done: [],
    }

    tasks.forEach((task) => {
      const status = task.status as TaskStatus
      if (newColumns[status]) {
        newColumns[status].push(task)
      }
    })

    // Only update if the structure actually changed
    setLocalColumns((prev) => {
      // Check if the new columns are different from current
      const hasChanged = Object.keys(newColumns).some((status) => {
        const prevTasks = prev[status as TaskStatus] ?? []
        const newTasks = newColumns[status as TaskStatus] ?? []
        if (prevTasks.length !== newTasks.length) return true
        return prevTasks.some((prevTask, idx) => {
          const newTask = newTasks[idx]
          return !newTask || prevTask.id !== newTask.id || prevTask.status !== newTask.status
        })
      })

      return hasChanged ? newColumns : prev
    })
  }, [tasks, activeDrag])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveDrag(null)

    if (!over) {
      return
    }

    const activeData = active.data.current as { type: 'card'; task: Task } | undefined
    const overData = over.data.current as { type: 'column'; status: TaskStatus } | undefined

    // Also check if over.id is a column status (fallback for when data.current is not set)
    const targetStatus = overData?.status || (over.id as TaskStatus)
    
    if (!activeData || activeData.type !== 'card') {
      // Try to find task by id if data.current is not set
      const task = tasks.find((t) => t.id === active.id)
      if (!task) return
      
      if (task.status === targetStatus) {
        return
      }

      // Optimistic update
      const fromStatus = task.status
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
        const updatedMoved: Task = {
          id: moved.id,
          title: moved.title,
          description: moved.description,
          priority: moved.priority,
          dueDate: moved.dueDate,
          status: toStatus,
          completed: toStatus === 'done',
          createdAt: moved.createdAt,
          subtasks: moved.subtasks,
        }
        const targetList = [...(prev[toStatus] ?? []), updatedMoved]

        return {
          ...prev,
          [fromStatus]: source,
          [toStatus]: targetList,
        }
      })

      try {
        await updateTask(task.id, {
          status: toStatus,
          completed: toStatus === 'done',
        })
      } catch (error) {
        // Rollback to server state on error
        const newColumns: Record<TaskStatus, Task[]> = {
          todo: [],
          'in-progress': [],
          done: [],
        }
        tasks.forEach((task) => {
          const status = task.status as TaskStatus
          if (newColumns[status]) {
            newColumns[status].push(task)
          }
        })
        setLocalColumns(newColumns)
        console.error('Failed to update task:', error)
      }
      return
    }

    const { task } = activeData

    if (task.status === targetStatus) {
      return
    }

    // Optimistic local move between columns
    const fromStatus = task.status
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
      const updatedMoved: Task = {
        id: moved.id,
        title: moved.title,
        description: moved.description,
        priority: moved.priority,
        dueDate: moved.dueDate,
        status: toStatus,
        completed: toStatus === 'done',
        createdAt: moved.createdAt,
        subtasks: moved.subtasks,
      }
      const targetList = [...(prev[toStatus] ?? []), updatedMoved]

      return {
        ...prev,
        [fromStatus]: source,
        [toStatus]: targetList,
      }
    })

    try {
      await updateTask(task.id, {
        status: toStatus,
        completed: toStatus === 'done',
      })
    } catch (error) {
      // Rollback to server state on error
      const newColumns: Record<TaskStatus, Task[]> = {
        todo: [],
        'in-progress': [],
        done: [],
      }
      tasks.forEach((task) => {
        const status = task.status as TaskStatus
        if (newColumns[status]) {
          newColumns[status].push(task)
        }
      })
      setLocalColumns(newColumns)
      console.error('Failed to update task:', error)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={(event) => {
        const data = event.active.data.current as { type: 'card'; task: Task } | undefined
        if (data?.type === 'card') {
          setActiveDrag({ id: event.active.id.toString(), task: data.task })
        } else {
          // Fallback: find task by id
          const task = tasks.find((t) => t.id === event.active.id)
          if (task) {
            setActiveDrag({ id: event.active.id.toString(), task })
          }
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

