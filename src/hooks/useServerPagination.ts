import { useState, useEffect } from 'react'
import { PaginatedResponse } from '../types/PaginatedResponse'

interface UseServerPaginationProps<T> {
    fetchFunction: (page: number, limit: number) => Promise<PaginatedResponse<T>>
    initialPage?: number
    initialLimit?: number
    dependencies?: unknown[]
}

interface UseServerPaginationReturn<T> {
    data: T[]
    loading: boolean
    error: string | null
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNext: boolean
    hasPrevious: boolean
    goToPage: (page: number) => void
    setItemsPerPage: (limit: number) => void
    refresh: () => void
}

export function useServerPagination<T>({
    fetchFunction,
    initialPage = 1,
    initialLimit = 10,
    dependencies = []
}: UseServerPaginationProps<T>): UseServerPaginationReturn<T> {
    const [data, setData] = useState<T[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(initialPage)
    const [itemsPerPage, setItemsPerPageState] = useState(initialLimit)
    const [totalPages, setTotalPages] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [hasNext, setHasNext] = useState(false)
    const [hasPrevious, setHasPrevious] = useState(false)

    const fetchData = async (page: number, limit: number) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetchFunction(page, limit)
            setData(response.data)
            setCurrentPage(response.page)
            setTotalPages(response.totalPages)
            setTotalItems(response.count)
            setHasNext(response.hasNext)
            setHasPrevious(response.hasPrevious)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar los datos')
            console.error('Error fetching paginated data:', err)
        } finally {
            setLoading(false)
        }
    }

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    const setItemsPerPage = (limit: number) => {
        setItemsPerPageState(limit)
        setCurrentPage(1) // Reset to first page when changing limit
    }

    const refresh = () => {
        fetchData(currentPage, itemsPerPage)
    }

    // Fetch data when page, limit, or dependencies change
    useEffect(() => {
        fetchData(currentPage, itemsPerPage)
    }, [currentPage, itemsPerPage, ...dependencies])

    return {
        data,
        loading,
        error,
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage,
        hasNext,
        hasPrevious,
        goToPage,
        setItemsPerPage,
        refresh
    }
}
