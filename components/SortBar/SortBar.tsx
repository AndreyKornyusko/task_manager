'use client'

import { memo } from 'react'
import type { SortOptions, SortField, SortOrder } from '@/types/task'
import styles from './SortBar.module.scss'

interface SortBarProps {
  sortOptions: SortOptions
  onSortChange: (sortOptions: SortOptions) => void
}

function SortBarComponent({ sortOptions, onSortChange }: SortBarProps) {
  const handleFieldChange = (field: SortField) => {
    onSortChange({ ...sortOptions, field })
  }

  const handleOrderChange = (order: SortOrder) => {
    onSortChange({ ...sortOptions, order })
  }

  return (
    <div className={styles.container}>
      <div className={styles.group}>
        <label className={styles.label}>Sort by:</label>
        <select
          value={sortOptions.field}
          onChange={(e) => handleFieldChange(e.target.value as SortField)}
          className={styles.select}
        >
          <option value="createdAt">Creation Date</option>
          <option value="dueDate">Due Date</option>
          <option value="priority">Priority</option>
        </select>
      </div>

      <div className={styles.group}>
        <label className={styles.label}>Order:</label>
        <div className={styles.orderButtons}>
          <button
            onClick={() => handleOrderChange('asc')}
            className={`${styles.orderButton} ${sortOptions.order === 'asc' ? styles.active : ''}`}
            aria-label="Sort ascending"
          >
            ↑ Ascending
          </button>
          <button
            onClick={() => handleOrderChange('desc')}
            className={`${styles.orderButton} ${sortOptions.order === 'desc' ? styles.active : ''}`}
            aria-label="Sort descending"
          >
            ↓ Descending
          </button>
        </div>
      </div>
    </div>
  )
}

export const SortBar = memo(SortBarComponent)

