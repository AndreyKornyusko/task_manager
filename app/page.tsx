'use client'

import { useState, Suspense, lazy } from 'react'
import { useTasks } from '@/context/TaskContext'
import { useFilterAndSort } from '@/hooks/useFilterAndSort'
import { usePagination } from '@/hooks/usePagination'
import type { FilterOptions, SortOptions } from '@/types/task'
import { TaskList } from '@/components/TaskList/TaskList'
import { FilterBar } from '@/components/FilterBar/FilterBar'
import { SortBar } from '@/components/SortBar/SortBar'
import { Pagination } from '@/components/Pagination/Pagination'
import { ThemeToggle } from '@/components/ThemeToggle/ThemeToggle'
import Link from 'next/link'
import styles from './page.module.scss'

const KanbanBoard = lazy(() =>
  import('@/components/KanbanBoard/KanbanBoard').then((mod) => ({
    default: mod.KanbanBoard,
  }))
)

type ViewMode = 'list' | 'kanban'

export default function HomePage() {
  const { tasks, loading, error } = useTasks()
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    status: 'all',
    priority: 'all',
  })
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: 'createdAt',
    order: 'desc',
  })
  const [currentPage, setCurrentPage] = useState(1)

  const filteredAndSortedTasks = useFilterAndSort(tasks, filterOptions, sortOptions)
  const { paginatedItems, totalPages } = usePagination(filteredAndSortedTasks, 10, currentPage)

  // Reset to page 1 when filters or sorting change
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading tasks...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error: {error}</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Task Manager</h1>
        <div className={styles.headerActions}>
          <ThemeToggle />
          <Link href="/create" className={styles.createButton}>
            + New Task
          </Link>
        </div>
      </header>

      <div className={styles.viewToggle}>
        <button
          onClick={() => setViewMode('list')}
          className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
        >
          List View
        </button>
        <button
          onClick={() => setViewMode('kanban')}
          className={`${styles.viewButton} ${viewMode === 'kanban' ? styles.active : ''}`}
        >
          Kanban View
        </button>
      </div>

      {viewMode === 'list' && (
        <>
          <FilterBar filters={filterOptions} onFilterChange={setFilterOptions} />
          <SortBar sortOptions={sortOptions} onSortChange={setSortOptions} />
          <TaskList tasks={paginatedItems} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {viewMode === 'kanban' && (
        <Suspense fallback={<div className={styles.loading}>Loading Kanban board...</div>}>
          <KanbanBoard tasks={filteredAndSortedTasks} />
        </Suspense>
      )}
    </div>
  )
}

