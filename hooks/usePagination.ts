import { useMemo } from 'react'

export function usePagination<T>(items: T[], itemsPerPage: number, currentPage: number) {
  const totalPages = Math.ceil(items.length / itemsPerPage)

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return items.slice(startIndex, endIndex)
  }, [items, itemsPerPage, currentPage])

  return {
    paginatedItems,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  }
}



