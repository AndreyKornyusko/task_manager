import { useMemo } from 'react'
import type { Task, FilterOptions, SortOptions } from '@/types/task'

export function useFilterAndSort(
  tasks: Task[],
  filterOptions: FilterOptions,
  sortOptions: SortOptions
) {
  const filteredAndSortedTasks = useMemo(() => {
    // Apply filters
    let filtered = tasks.filter((task) => {
      // Status filter
      if (filterOptions.status === 'completed' && !task.completed) {
        return false
      }
      if (filterOptions.status === 'incomplete' && task.completed) {
        return false
      }

      // Priority filter
      if (filterOptions.priority !== 'all' && task.priority !== filterOptions.priority) {
        return false
      }

      return true
    })

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortOptions.field) {
        case 'createdAt':
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'dueDate':
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          break
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          comparison = priorityOrder[b.priority] - priorityOrder[a.priority]
          break
      }

      return sortOptions.order === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [tasks, filterOptions, sortOptions])

  return filteredAndSortedTasks
}


