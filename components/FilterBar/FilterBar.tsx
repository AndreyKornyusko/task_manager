'use client'

import { memo } from 'react'
import type { FilterOptions, FilterStatus, FilterPriority } from '@/types/task'
import styles from './FilterBar.module.scss'

interface FilterBarProps {
  filters: FilterOptions
  onFilterChange: (filters: FilterOptions) => void
}

function FilterBarComponent({ filters, onFilterChange }: FilterBarProps) {
  const handleStatusChange = (status: FilterStatus) => {
    onFilterChange({ ...filters, status })
  }

  const handlePriorityChange = (priority: FilterPriority) => {
    onFilterChange({ ...filters, priority })
  }

  const handleClearFilters = () => {
    onFilterChange({ status: 'all', priority: 'all' })
  }

  const hasActiveFilters = filters.status !== 'all' || filters.priority !== 'all'

  return (
    <div className={styles.container}>
      <div className={styles.group}>
        <label className={styles.label}>Status:</label>
        <div className={styles.buttons}>
          <button
            onClick={() => handleStatusChange('all')}
            className={`${styles.button} ${filters.status === 'all' ? styles.active : ''}`}
          >
            All
          </button>
          <button
            onClick={() => handleStatusChange('completed')}
            className={`${styles.button} ${filters.status === 'completed' ? styles.active : ''}`}
          >
            Completed
          </button>
          <button
            onClick={() => handleStatusChange('incomplete')}
            className={`${styles.button} ${filters.status === 'incomplete' ? styles.active : ''}`}
          >
            Incomplete
          </button>
        </div>
      </div>

      <div className={styles.group}>
        <label className={styles.label}>Priority:</label>
        <div className={styles.buttons}>
          <button
            onClick={() => handlePriorityChange('all')}
            className={`${styles.button} ${filters.priority === 'all' ? styles.active : ''}`}
          >
            All
          </button>
          <button
            onClick={() => handlePriorityChange('low')}
            className={`${styles.button} ${filters.priority === 'low' ? styles.active : ''}`}
          >
            Low
          </button>
          <button
            onClick={() => handlePriorityChange('medium')}
            className={`${styles.button} ${filters.priority === 'medium' ? styles.active : ''}`}
          >
            Medium
          </button>
          <button
            onClick={() => handlePriorityChange('high')}
            className={`${styles.button} ${filters.priority === 'high' ? styles.active : ''}`}
          >
            High
          </button>
        </div>
      </div>

      {hasActiveFilters && (
        <button onClick={handleClearFilters} className={styles.clearButton}>
          Clear Filters
        </button>
      )}
    </div>
  )
}

export const FilterBar = memo(FilterBarComponent)

