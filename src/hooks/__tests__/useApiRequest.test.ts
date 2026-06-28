// @vitest-environment jsdom
/**
 * Pruebas de useApiRequest: estados de carga/éxito/error, deduplicación de
 * peticiones en vuelo, retry manual y reintentos ante errores de red.
 */
import { createElement, StrictMode, type ReactNode } from 'react'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useApiRequest } from '../useApiRequest'

const showError = vi.fn()
const showSuccess = vi.fn()
const StrictModeWrapper = ({ children }: { children: ReactNode }) =>
  createElement(StrictMode, null, children)

vi.mock('../useToast', () => ({
  useToast: () => ({ showError, showSuccess }),
}))

describe('useApiRequest', () => {
  it('ejecuta la petición y expone data/loading', async () => {
    const requestFn = vi.fn().mockResolvedValue({ id: 1 })
    const { result } = renderHook(() => useApiRequest(requestFn))

    let returned: unknown
    await act(async () => {
      returned = await result.current.execute()
    })

    expect(returned).toEqual({ id: 1 })
    expect(result.current.data).toEqual({ id: 1 })
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('captura el error, muestra toast y devuelve null', async () => {
    const requestFn = vi.fn().mockRejectedValue(new Error('Falló la petición'))
    const { result } = renderHook(() => useApiRequest(requestFn))

    let returned: unknown
    await act(async () => {
      returned = await result.current.execute()
    })

    expect(returned).toBeNull()
    expect(result.current.error).toBe('Falló la petición')
    expect(showError).toHaveBeenCalledWith('Falló la petición')
  })

  it('deduplica ejecuciones concurrentes con los mismos argumentos', async () => {
    let resolveRequest: (value: string) => void = () => {}
    const requestFn = vi.fn(
      () => new Promise<string>((resolve) => { resolveRequest = resolve }),
    )
    const { result } = renderHook(() => useApiRequest<string, [number]>(requestFn))

    let first: Promise<string | null>
    let second: Promise<string | null>
    act(() => {
      first = result.current.execute(7)
      second = result.current.execute(7)
    })

    await act(async () => {
      resolveRequest('ok')
      await Promise.all([first, second])
    })

    expect(requestFn).toHaveBeenCalledTimes(1)
    await expect(first!).resolves.toBe('ok')
    await expect(second!).resolves.toBe('ok')
  })

  it('retry() reutiliza los últimos argumentos', async () => {
    const requestFn = vi.fn().mockResolvedValue('ok')
    const { result } = renderHook(() => useApiRequest<string, [number, string]>(requestFn))

    await act(async () => {
      await result.current.execute(5, 'abc')
    })
    await waitFor(() => expect(result.current.lastArgs).toEqual([5, 'abc']))

    await act(async () => {
      await result.current.retry()
    })

    expect(requestFn).toHaveBeenCalledTimes(2)
    expect(requestFn).toHaveBeenLastCalledWith(5, 'abc')
  })

  it('reintenta errores de red hasta maxRetries y luego tiene éxito', async () => {
    const networkError = Object.assign(new Error('Network Error'), { code: 'ERR_NETWORK' })
    const requestFn = vi
      .fn()
      .mockRejectedValueOnce(networkError)
      .mockResolvedValueOnce('recuperado')
    const { result } = renderHook(() =>
      useApiRequest(requestFn, { maxRetries: 1, retryDelayMs: 0 }),
    )

    let returned: unknown
    await act(async () => {
      returned = await result.current.execute()
    })

    expect(requestFn).toHaveBeenCalledTimes(2)
    expect(returned).toBe('recuperado')
    expect(result.current.error).toBeNull()
  })

  it('muestra toast de éxito cuando está configurado', async () => {
    const requestFn = vi.fn().mockResolvedValue('ok')
    const { result } = renderHook(() =>
      useApiRequest(requestFn, { successMessage: 'Guardado', showSuccessToast: true }),
    )

    await act(async () => {
      await result.current.execute()
    })

    expect(showSuccess).toHaveBeenCalledWith('Guardado')
  })

  it('ejecuta la petición después del ciclo extra de StrictMode', async () => {
    const requestFn = vi.fn().mockResolvedValue('ok')
    const { result } = renderHook(() => useApiRequest(requestFn), {
      wrapper: StrictModeWrapper,
    })

    let returned: unknown
    await act(async () => {
      returned = await result.current.execute()
    })

    expect(returned).toBe('ok')
    expect(requestFn).toHaveBeenCalledTimes(1)
  })

  it('reset() limpia data, error y últimos argumentos', async () => {
    const requestFn = vi.fn().mockResolvedValue('ok')
    const { result } = renderHook(() => useApiRequest<string, [number]>(requestFn))

    await act(async () => {
      await result.current.execute(1)
    })
    act(() => {
      result.current.reset()
    })

    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
    expect(result.current.lastArgs).toBeNull()
  })
})
