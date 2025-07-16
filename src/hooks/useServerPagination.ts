import { useState, useEffect } from 'react'
import { PaginatedResponse } from '../types/PaginatedResponse'

interface Filters {
    startDate?: string,
    endDate?: string,
    supplierId?: string,
    productId?: string,
    activeDate: boolean
}

interface UseServerPaginationProps<T> {
    fetchFunction: (page: number, limit: number) => Promise<PaginatedResponse<T>>
    fetchWithFilters?: (filters: Filters, page?: number, limit?: number) => Promise<PaginatedResponse<T>>
    initialPage?: number
    initialLimit?: number
    filters?: Filters
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
    refreshWithFilters: (filters: Filters) => Promise<PaginatedResponse<T>>
    addItem: (newItem: T) => void
    updateItem: (updatedItem: T, idField?: keyof T) => void
    removeItem: (itemId: string | number, idField?: keyof T) => void
    setActiveFilters: (active: boolean) => void
}

export function useServerPagination<T>({
    fetchFunction,
    fetchWithFilters,
    filters,
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
    const [activeFilters, setActiveFilters] = useState(false)

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

    // CRUD operations for local state updates
    const addItem = (newItem: T) => {
        setData(prev => [newItem, ...prev])
        setTotalItems(prev => prev + 1)
        // Recalculate total pages if needed
        const newTotalPages = Math.ceil((totalItems + 1) / itemsPerPage)
        setTotalPages(newTotalPages)
    }

    const updateItem = (updatedItem: T, idField: keyof T = 'id' as keyof T) => {
        setData(prev => prev.map(item =>
            item[idField] === updatedItem[idField] ? updatedItem : item
        ))
    }

    const removeItem = (itemId: string | number, idField: keyof T = 'id' as keyof T) => {
        setData(prev => prev.filter(item => item[idField] !== itemId))
        setTotalItems(prev => prev - 1)
        // Recalculate total pages if needed
        const newTotalPages = Math.ceil((totalItems - 1) / itemsPerPage)
        setTotalPages(Math.max(1, newTotalPages))

        // If current page becomes empty and it's not the first page, go to previous page
        if (data.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1)
        }
    }

    const refreshWithFilters = async (filters: Filters) => {
        setLoading(true)
        setError(null)
        try {
            if (fetchWithFilters === undefined) {
                throw new Error("No hay llamados para realizar los filtros")
            }
            const response = await fetchWithFilters(filters, currentPage, itemsPerPage)
            setData(response.data)
            setCurrentPage(response.page)
            setTotalPages(response.totalPages)
            setTotalItems(response.count)
            setHasNext(response.hasNext)
            setHasPrevious(response.hasPrevious)
            return response
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar los datos')
            console.error('Error fetching paginated data:', err)
            throw err
        } finally {
            setLoading(false)
        }
    }

    // Fetch data when page, limit, or dependencies change
    useEffect(() => {
        if (activeFilters && filters) {
            refreshWithFilters(filters)
        } else {
            fetchData(currentPage, itemsPerPage)
        }
    }, [currentPage, itemsPerPage, activeFilters, ...dependencies])

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
        refresh,
        refreshWithFilters,
        addItem,
        updateItem,
        removeItem,
        setActiveFilters
    }
}
