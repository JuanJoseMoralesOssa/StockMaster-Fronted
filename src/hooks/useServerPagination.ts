import { useState, useEffect, useCallback, useRef } from 'react'
import { useToast } from './useToast'
import { PaginatedResponse } from '../types/PaginatedResponse'

interface UseServerPaginationProps<T, TFilter = object> {
    fetchFunction: (page: number, limit: number) => Promise<PaginatedResponse<T>>
    fetchWithFilters?: (filters: TFilter, page?: number, limit?: number) => Promise<PaginatedResponse<T>>
    initialPage?: number
    initialLimit?: number
    filters?: TFilter
    refreshToken?: number
}

interface UseServerPaginationReturn<T, TFilter = object> {
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
    refreshWithFilters: (filters: TFilter) => Promise<PaginatedResponse<T> | null>
    addItem: (newItem: T) => void
    updateItem: (updatedItem: T, idField?: keyof T) => void
    removeItem: (itemId: string | number, idField?: keyof T) => void
    setActiveFilters: (active: boolean) => void
    retry?: () => Promise<PaginatedResponse<T> | null>
    requestMeta?: {
        lastArgs: unknown | null
        lastResponse: PaginatedResponse<T> | null
    }
    filterRequestMeta?: {
        lastArgs: unknown | null
        lastResponse: PaginatedResponse<T> | null
    }
}

export function useServerPagination<T, TFilter = object>({
    fetchFunction,
    fetchWithFilters,
    filters,
    initialPage = 1,
    initialLimit = 10,
    refreshToken = 0,
}: UseServerPaginationProps<T, TFilter>): UseServerPaginationReturn<T, TFilter> {
    const [data, setData] = useState<T[]>([])
    const [currentPage, setCurrentPage] = useState(initialPage)
    const [itemsPerPage, setItemsPerPageState] = useState(initialLimit)
    const [totalPages, setTotalPages] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [hasNext, setHasNext] = useState(false)
    const [hasPrevious, setHasPrevious] = useState(false)
    const [activeFilters, setActiveFilters] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { showError } = useToast()
    const lastResponseRef = useRef<PaginatedResponse<T> | null>(null)

    const applyResponse = useCallback((response: PaginatedResponse<T>) => {
        setData(response.data)
        setCurrentPage(response.page)
        setTotalPages(response.totalPages)
        setTotalItems(response.count)
        setHasNext(response.hasNext)
        setHasPrevious(response.hasPrevious)
        lastResponseRef.current = response
    }, [])

    const runRequest = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            if (activeFilters && filters && fetchWithFilters) {
                const response = await fetchWithFilters(filters, currentPage, itemsPerPage)
                applyResponse(response)
                return
            }

            const response = await fetchFunction(currentPage, itemsPerPage)
            applyResponse(response)
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al cargar los datos'
            setError(message)
            showError(message)
        } finally {
            setLoading(false)
        }
    }, [activeFilters, filters, fetchFunction, fetchWithFilters, currentPage, itemsPerPage, applyResponse, showError])

    const goToPage = useCallback((page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
        }
    }, [totalPages])

    const setItemsPerPage = useCallback((limit: number) => {
        setItemsPerPageState(limit)
        setCurrentPage(1)
    }, [])

    const addItem = (newItem: T) => {
        setData(prev => [newItem, ...prev])
        setTotalItems(prev => prev + 1)
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
        const newTotalPages = Math.ceil((totalItems - 1) / itemsPerPage)
        setTotalPages(Math.max(1, newTotalPages))

        if (data.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1)
        }
    }

    const refreshWithFilters = useCallback(async (filtersArg: TFilter) => {
        if (!fetchWithFilters) {
            throw new Error('No hay llamados para realizar los filtros')
        }
        setLoading(true)
        setError(null)
        try {
            const response = await fetchWithFilters(filtersArg, currentPage, itemsPerPage)
            applyResponse(response)
            return response
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al cargar los datos'
            setError(message)
            showError(message)
            return null
        } finally {
            setLoading(false)
        }
    }, [fetchWithFilters, currentPage, itemsPerPage, applyResponse, showError])

    const refresh = useCallback(() => {
        void runRequest()
    }, [runRequest])

    const retry = useCallback(async () => {
        await runRequest()
        return lastResponseRef.current
    }, [runRequest])

    useEffect(() => {
        void runRequest()
    }, [currentPage, itemsPerPage, refreshToken, runRequest])

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
        retry,
        requestMeta: {
            lastArgs: null,
            lastResponse: lastResponseRef.current,
        },
        filterRequestMeta: {
            lastArgs: null,
            lastResponse: lastResponseRef.current,
        },
        addItem,
        updateItem,
        removeItem,
        setActiveFilters,
    }
}
