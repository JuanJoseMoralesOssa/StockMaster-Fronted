// @vitest-environment jsdom
/**
 * Pruebas de useServerPagination: fetch inicial, navegación de páginas,
 * filtros activos, manejo de error y mutaciones optimistas de la lista.
 */
import { renderHook, act, waitFor } from '@testing-library/react'
import { useServerPagination } from '../useServerPagination'
import { PaginatedResponse } from '../../types/PaginatedResponse'

const showError = vi.fn()

vi.mock('../useToast', () => ({
  useToast: () => ({ showError, showSuccess: vi.fn() }),
}))

type Item = { id: number; name: string }

function pageResponse(data: Item[], page = 1, limit = 10, count = data.length): PaginatedResponse<Item> {
  const totalPages = Math.max(1, Math.ceil(count / limit))
  return {
    data,
    page,
    limit,
    count,
    totalPages,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
  }
}

describe('useServerPagination', () => {
  it('hace el fetch inicial al montar y publica los datos', async () => {
    const fetchFunction = vi.fn().mockResolvedValue(pageResponse([{ id: 1, name: 'A' }]))
    const { result } = renderHook(() => useServerPagination<Item>({ fetchFunction }))

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(fetchFunction).toHaveBeenCalledWith(1, 10)
    expect(result.current.data).toEqual([{ id: 1, name: 'A' }])
    expect(result.current.totalItems).toBe(1)
    expect(result.current.error).toBeNull()
  })

  it('goToPage pide la página solicitada (dentro del rango)', async () => {
    const fetchFunction = vi.fn().mockImplementation((page: number) =>
      Promise.resolve(pageResponse([{ id: page, name: `P${page}` }], page, 10, 25)),
    )
    const { result } = renderHook(() => useServerPagination<Item>({ fetchFunction }))

    await waitFor(() => expect(result.current.totalPages).toBe(3))

    act(() => {
      result.current.goToPage(2)
    })

    await waitFor(() => expect(result.current.currentPage).toBe(2))
    expect(fetchFunction).toHaveBeenLastCalledWith(2, 10)

    // Fuera de rango: no dispara nada nuevo
    const callsBefore = fetchFunction.mock.calls.length
    act(() => {
      result.current.goToPage(99)
    })
    expect(fetchFunction.mock.calls.length).toBe(callsBefore)
  })

  it('setItemsPerPage cambia el límite y vuelve a la página 1', async () => {
    const fetchFunction = vi.fn().mockResolvedValue(pageResponse([], 1, 25, 0))
    const { result } = renderHook(() => useServerPagination<Item>({ fetchFunction }))

    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.setItemsPerPage(25)
    })

    await waitFor(() => expect(fetchFunction).toHaveBeenLastCalledWith(1, 25))
  })

  it('publica el error y muestra toast cuando el fetch falla', async () => {
    const fetchFunction = vi.fn().mockRejectedValue(new Error('Servidor caído'))
    const { result } = renderHook(() => useServerPagination<Item>({ fetchFunction }))

    await waitFor(() => expect(result.current.error).toBe('Servidor caído'))
    expect(showError).toHaveBeenCalledWith('Servidor caído')
    expect(result.current.data).toEqual([])
  })

  it('usa fetchWithFilters cuando los filtros están activos', async () => {
    type Filters = { name: string }
    const fetchFunction = vi.fn().mockResolvedValue(pageResponse([]))
    const fetchWithFilters = vi
      .fn()
      .mockResolvedValue(pageResponse([{ id: 9, name: 'filtrado' }]))

    const { result } = renderHook(() =>
      useServerPagination<Item, Filters>({
        fetchFunction,
        fetchWithFilters,
        filters: { name: 'fil' },
        initialActiveFilters: true,
      }),
    )

    await waitFor(() => expect(result.current.data).toEqual([{ id: 9, name: 'filtrado' }]))
    expect(fetchWithFilters).toHaveBeenCalledWith({ name: 'fil' }, 1, 10)
    expect(fetchFunction).not.toHaveBeenCalled()
  })

  it('addItem y removeItem actualizan la lista y el contador', async () => {
    const fetchFunction = vi
      .fn()
      .mockResolvedValue(pageResponse([{ id: 1, name: 'A' }, { id: 2, name: 'B' }]))
    const { result } = renderHook(() => useServerPagination<Item>({ fetchFunction }))

    await waitFor(() => expect(result.current.data).toHaveLength(2))

    act(() => {
      result.current.addItem({ id: 3, name: 'C' })
    })
    expect(result.current.data).toHaveLength(3)
    expect(result.current.totalItems).toBe(3)

    act(() => {
      result.current.removeItem(1)
    })
    expect(result.current.data.map((i) => i.id)).toEqual([3, 2])
    expect(result.current.totalItems).toBe(2)
  })

  it('updateItem reemplaza el elemento por id', async () => {
    const fetchFunction = vi.fn().mockResolvedValue(pageResponse([{ id: 1, name: 'A' }]))
    const { result } = renderHook(() => useServerPagination<Item>({ fetchFunction }))

    await waitFor(() => expect(result.current.data).toHaveLength(1))

    act(() => {
      result.current.updateItem({ id: 1, name: 'A editado' })
    })

    expect(result.current.data[0].name).toBe('A editado')
  })
})
