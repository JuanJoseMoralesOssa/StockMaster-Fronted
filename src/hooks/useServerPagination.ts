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
    addItem: (newItem: T) => void
    updateItem: (updatedItem: T, idField?: keyof T) => void
    removeItem: (itemId: string | number, idField?: keyof T) => void
}

/**
 * Custom hook for server-side pagination with local CRUD operations
 *
 * This hook is intentionally generic and does NOT handle toasts/notifications.
 * Use useToast() in your components for specific success/error messages.
 *
 * @example
 * // Basic usage with proper toast handling
 * const { data, loading, addItem, updateItem, removeItem } = useServerPagination({
 *   fetchFunction: (page, limit) => fetchProducts(page, limit)
 * })
 * const { showSuccess, showError } = useToast()
 *
 * // Create: Add new item to local state after successful server creation
 * const handleCreate = async (newProduct) => {
 *   try {
 *     const createdProduct = await createProduct(newProduct)
 *     addItem(createdProduct)
 *     showSuccess("Producto creado exitosamente")
 *   } catch (error) {
 *     showError("Error al crear el producto")
 *   }
 * }
 *
 * // Update: Modify existing item in local state after successful server update
 * const handleUpdate = async (productId, updates) => {
 *   try {
 *     const updatedProduct = await updateProduct(productId, updates)
 *     updateItem(updatedProduct) // Uses 'id' field by default
 *     showSuccess("Producto actualizado exitosamente")
 *   } catch (error) {
 *     showError("Error al actualizar el producto")
 *   }
 * }
 *
 * // Delete: Remove item from local state after successful server deletion
 * const handleDelete = async (productId) => {
 *   try {
 *     await deleteProduct(productId)
 *     removeItem(productId) // Uses 'id' field by default
 *     showSuccess("Producto eliminado exitosamente")
 *   } catch (error) {
 *     showError("Error al eliminar el producto")
 *   }
 * }
 */
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

    // CRUD operations for local state updates
    const addItem = (newItem: T) => {
        setData(prev => [...prev, newItem])
        setTotalItems(prev => prev + 1)
        // Recalculate total pages if needed
        const newTotalPages = Math.ceil((totalItems + 1) / itemsPerPage)
        setTotalPages(newTotalPages)
    }

    const updateItem = (updatedItem: T, idField: keyof T = 'id' as keyof T) => {
        console.log('Updating item:', updatedItem, 'using field:', idField);
        console.log('Current data before update:', data);
        setData(prev => prev.map(item =>
            item[idField] === updatedItem[idField] ? updatedItem : item
        ))
        console.log('Data after update:', data);
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
        refresh,
        addItem,
        updateItem,
        removeItem
    }
}
