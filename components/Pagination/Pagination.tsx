'use client'

import { memo } from 'react'
import styles from './Pagination.module.scss'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

function PaginationComponent({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  const handlePageClick = (page: number) => {
    onPageChange(page)
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('ellipsis')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('ellipsis')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className={styles.container}>
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className={styles.button}
        aria-label="Previous page"
      >
        ← Previous
      </button>

      <div className={styles.pages}>
        {getPageNumbers().map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <span key={`ellipsis-${index}`} className={styles.ellipsis}>
                ...
              </span>
            )
          }

          const pageNumber = page as number
          return (
            <button
              key={pageNumber}
              onClick={() => handlePageClick(pageNumber)}
              className={`${styles.pageButton} ${currentPage === pageNumber ? styles.active : ''}`}
              aria-label={`Go to page ${pageNumber}`}
              aria-current={currentPage === pageNumber ? 'page' : undefined}
            >
              {pageNumber}
            </button>
          )
        })}
      </div>

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className={styles.button}
        aria-label="Next page"
      >
        Next →
      </button>

      <div className={styles.info}>
        Page {currentPage} of {totalPages}
      </div>
    </div>
  )
}

export const Pagination = memo(PaginationComponent)

