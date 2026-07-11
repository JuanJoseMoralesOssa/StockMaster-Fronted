// @vitest-environment jsdom
import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useObjectUrl } from '../useObjectUrl'

const createObjectURL = vi.fn()
const revokeObjectURL = vi.fn()

const blob = (content: string) => new Blob([content])

beforeEach(() => {
  let counter = 0
  createObjectURL.mockImplementation(() => `blob:mock-${++counter}`)
  vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })
})

afterEach(() => {
  vi.clearAllMocks()
  vi.unstubAllGlobals()
})

describe('useObjectUrl', () => {
  it('creates a URL for the blob', () => {
    const { result } = renderHook(() => useObjectUrl(blob('a')))

    expect(result.current).toBe('blob:mock-1')
  })

  it.each([
    ['null', null],
    ['undefined', undefined],
  ])('returns null and creates nothing for %s', (_name, source) => {
    const { result } = renderHook(() => useObjectUrl(source))

    expect(result.current).toBeNull()
    expect(createObjectURL).not.toHaveBeenCalled()
  })

  // El punto del hook: nadie tiene que acordarse de revocar en cada camino.
  it('revokes the previous URL when the blob is replaced', () => {
    const { result, rerender } = renderHook(({ source }) => useObjectUrl(source), {
      initialProps: { source: blob('first') as Blob | null },
    })
    expect(result.current).toBe('blob:mock-1')

    rerender({ source: blob('second') })

    expect(result.current).toBe('blob:mock-2')
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-1')
  })

  it('revokes the URL when the blob is cleared', () => {
    const { result, rerender } = renderHook(({ source }) => useObjectUrl(source), {
      initialProps: { source: blob('only') as Blob | null },
    })

    rerender({ source: null })

    expect(result.current).toBeNull()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-1')
  })

  it('revokes the URL on unmount', () => {
    const { unmount } = renderHook(() => useObjectUrl(blob('a')))
    expect(revokeObjectURL).not.toHaveBeenCalled()

    unmount()

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-1')
  })

  it('keeps the same URL while the blob is unchanged', () => {
    const source = blob('stable')
    const { result, rerender } = renderHook(() => useObjectUrl(source))

    rerender()

    expect(result.current).toBe('blob:mock-1')
    expect(createObjectURL).toHaveBeenCalledTimes(1)
    expect(revokeObjectURL).not.toHaveBeenCalled()
  })
})
