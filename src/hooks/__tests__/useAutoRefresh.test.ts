// @vitest-environment jsdom
/**
 * Pruebas de useAutoRefresh: ejecución periódica del callback mientras la
 * pestaña está visible, limpieza del timer al desmontar/deshabilitar, uso del
 * callback más reciente, y el "catch-up" al recuperar visibilidad tras un
 * período oculto más largo que el intervalo.
 */
import { renderHook, act } from '@testing-library/react'
import { useAutoRefresh } from '../useAutoRefresh'

let visibilityState: DocumentVisibilityState = 'visible'

beforeEach(() => {
  vi.useFakeTimers()
  visibilityState = 'visible'
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => visibilityState,
  })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useAutoRefresh', () => {
  it('llama a refresh cuando se cumple el intervalo con la pestaña visible', () => {
    const refresh = vi.fn()
    renderHook(() => useAutoRefresh(refresh, { intervalMs: 1000 }))

    expect(refresh).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(refresh).toHaveBeenCalledTimes(1)
  })

  it('se repite en cada intervalo sucesivo', () => {
    const refresh = vi.fn()
    renderHook(() => useAutoRefresh(refresh, { intervalMs: 1000 }))

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(refresh).toHaveBeenCalledTimes(3)
  })

  it('limpia el timer al desmontar: no hay llamadas después del unmount', () => {
    const refresh = vi.fn()
    const { unmount } = renderHook(() => useAutoRefresh(refresh, { intervalMs: 1000 }))

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(refresh).toHaveBeenCalledTimes(1)

    unmount()

    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(refresh).toHaveBeenCalledTimes(1)
  })

  it('no programa nada cuando enabled=false', () => {
    const refresh = vi.fn()
    renderHook(() => useAutoRefresh(refresh, { intervalMs: 1000, enabled: false }))

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(refresh).not.toHaveBeenCalled()
  })

  it('usa siempre el callback más reciente sin reiniciar el timer', () => {
    const first = vi.fn()
    const second = vi.fn()
    const { rerender } = renderHook(({ cb }) => useAutoRefresh(cb, { intervalMs: 1000 }), {
      initialProps: { cb: first },
    })

    rerender({ cb: second })

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
  })

  it('no ejecuta el refresh mientras la pestaña está oculta', () => {
    visibilityState = 'hidden'
    const refresh = vi.fn()
    renderHook(() => useAutoRefresh(refresh, { intervalMs: 1000 }))

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(refresh).not.toHaveBeenCalled()
  })

  it('al recuperar visibilidad tras superar el intervalo oculto, ejecuta refresh de inmediato', () => {
    const refresh = vi.fn()
    renderHook(() => useAutoRefresh(refresh, { intervalMs: 1000 }))

    visibilityState = 'hidden'
    act(() => {
      vi.advanceTimersByTime(1500) // el setInterval dispara pero se salta por estar oculto
    })
    expect(refresh).not.toHaveBeenCalled()

    visibilityState = 'visible'
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })

    expect(refresh).toHaveBeenCalledTimes(1)
  })

  it('no dispara un refresh extra si vuelve visible antes de cumplir el intervalo', () => {
    const refresh = vi.fn()
    renderHook(() => useAutoRefresh(refresh, { intervalMs: 1000 }))

    visibilityState = 'hidden'
    act(() => {
      vi.advanceTimersByTime(500)
    })

    visibilityState = 'visible'
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })

    expect(refresh).not.toHaveBeenCalled()
  })

  it('deja de reaccionar a visibilitychange después de desmontar', () => {
    const refresh = vi.fn()
    const { unmount } = renderHook(() => useAutoRefresh(refresh, { intervalMs: 1000 }))

    visibilityState = 'hidden'
    act(() => {
      vi.advanceTimersByTime(1500)
    })

    unmount()

    visibilityState = 'visible'
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })

    expect(refresh).not.toHaveBeenCalled()
  })
})
