import { useState, useMemo } from 'react'

export interface PaginationOptions {
    initialPage?: number
    initialItemsPerPage?: number
}

export interface UsePaginationReturn<T> {
    // Current page data
    currentPageData: T[]

    // Pagination state
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number

    // Actions
    goToPage: (page: number) => void
    goToNextPage: () => void
    goToPreviousPage: () => void
    goToFirstPage: () => void
    goToLastPage: () => void
    setItemsPerPage: (itemsPerPage: number) => void

    // Helpers
    hasNextPage: boolean
    hasPreviousPage: boolean
    startIndex: number
    endIndex: number
}

export function usePagination<T>(
    data: T[],
    options: PaginationOptions = {}
): UsePaginationReturn<T> {
    const { initialPage = 1, initialItemsPerPage = 10 } = options

    const [currentPage, setCurrentPage] = useState(initialPage)
    const [itemsPerPage, setItemsPerPageState] = useState(initialItemsPerPage)

    const totalItems = data.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)

    // Calculate current page data
    const currentPageData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return data.slice(startIndex, endIndex)
    }, [data, currentPage, itemsPerPage])

    // Navigation functions
    const goToPage = (page: number) => {
        const newPage = Math.max(1, Math.min(page, totalPages))
        setCurrentPage(newPage)
    }

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1)
        }
    }

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1)
        }
    }

    const goToFirstPage = () => {
        setCurrentPage(1)
    }

    const goToLastPage = () => {
        setCurrentPage(totalPages)
    }

    const setItemsPerPage = (newItemsPerPage: number) => {
        setItemsPerPageState(newItemsPerPage)
        // Reset to first page when changing items per page
        setCurrentPage(1)
    }

    // Derived state
    const hasNextPage = currentPage < totalPages
    const hasPreviousPage = currentPage > 1
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = Math.min(startIndex + itemsPerPage - 1, totalItems - 1)

    return {
        currentPageData,
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage,
        goToPage,
        goToNextPage,
        goToPreviousPage,
        goToFirstPage,
        goToLastPage,
        setItemsPerPage,
        hasNextPage,
        hasPreviousPage,
        startIndex,
        endIndex,
    }
}
