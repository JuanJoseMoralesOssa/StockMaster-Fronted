// @vitest-environment jsdom
/**
 * Pruebas de useFocusTrap: Tab desde el último elemento enfocable cicla al
 * primero, Shift+Tab desde el primero cicla al último, Escape invoca
 * onClose, y el listener se limpia al desmontar / cerrar / no montarse.
 *
 * El hook en sí NO restaura el foco al elemento previo (eso lo hace Modal.tsx
 * en su propio efecto) — por eso esa conducta no se prueba aquí.
 */
import { renderHook, fireEvent } from '@testing-library/react'
import type { RefObject } from 'react'
import { useFocusTrap } from '../useFocusTrap'

function buildContainer(buttonLabels: string[]): HTMLDivElement {
  const container = document.createElement('div')
  buttonLabels.forEach((label) => {
    const button = document.createElement('button')
    button.textContent = label
    container.appendChild(button)
  })
  document.body.appendChild(container)
  return container
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('useFocusTrap', () => {
  it('Tab desde el último elemento enfocable cicla al primero', () => {
    const container = buildContainer(['Primero', 'Medio', 'Último'])
    const ref: RefObject<HTMLElement | null> = { current: container }
    const buttons = Array.from(container.querySelectorAll('button'))
    renderHook(() => useFocusTrap(ref, { open: true, onClose: vi.fn() }))

    buttons[2].focus()
    expect(document.activeElement).toBe(buttons[2])

    const notPrevented = fireEvent.keyDown(document, { key: 'Tab' })

    expect(document.activeElement).toBe(buttons[0])
    expect(notPrevented).toBe(false) // dispatchEvent devuelve false cuando se llamó preventDefault
  })

  it('Shift+Tab desde el primer elemento cicla al último', () => {
    const container = buildContainer(['Primero', 'Medio', 'Último'])
    const ref: RefObject<HTMLElement | null> = { current: container }
    const buttons = Array.from(container.querySelectorAll('button'))
    renderHook(() => useFocusTrap(ref, { open: true, onClose: vi.fn() }))

    buttons[0].focus()

    const notPrevented = fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })

    expect(document.activeElement).toBe(buttons[2])
    expect(notPrevented).toBe(false)
  })

  it('Tab en un elemento intermedio no fuerza el foco ni previene el default', () => {
    const container = buildContainer(['Primero', 'Medio', 'Último'])
    const ref: RefObject<HTMLElement | null> = { current: container }
    const buttons = Array.from(container.querySelectorAll('button'))
    renderHook(() => useFocusTrap(ref, { open: true, onClose: vi.fn() }))

    buttons[1].focus()

    const notPrevented = fireEvent.keyDown(document, { key: 'Tab' })

    expect(document.activeElement).toBe(buttons[1])
    expect(notPrevented).toBe(true)
  })

  it('Escape invoca onClose', () => {
    const container = buildContainer(['Primero'])
    const ref: RefObject<HTMLElement | null> = { current: container }
    const onClose = vi.fn()
    renderHook(() => useFocusTrap(ref, { open: true, onClose }))

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('no reacciona a Tab/Escape cuando open=false', () => {
    const container = buildContainer(['Primero', 'Último'])
    const ref: RefObject<HTMLElement | null> = { current: container }
    const buttons = Array.from(container.querySelectorAll('button'))
    const onClose = vi.fn()
    renderHook(() => useFocusTrap(ref, { open: false, onClose }))

    buttons[1].focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(buttons[1])
  })

  it('limpia el listener al desmontar: Escape ya no llama a onClose', () => {
    const container = buildContainer(['Primero'])
    const ref: RefObject<HTMLElement | null> = { current: container }
    const onClose = vi.fn()
    const { unmount } = renderHook(() => useFocusTrap(ref, { open: true, onClose }))

    unmount()

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).not.toHaveBeenCalled()
  })

  it('limpia el listener cuando open pasa de true a false', () => {
    const container = buildContainer(['Primero'])
    const ref: RefObject<HTMLElement | null> = { current: container }
    const onClose = vi.fn()
    const { rerender } = renderHook(
      ({ open }: { open: boolean }) => useFocusTrap(ref, { open, onClose }),
      { initialProps: { open: true } },
    )

    rerender({ open: false })

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).not.toHaveBeenCalled()
  })

  it('no lanza error ni mueve el foco si el contenedor no tiene elementos enfocables', () => {
    const container = buildContainer([])
    const ref: RefObject<HTMLElement | null> = { current: container }
    renderHook(() => useFocusTrap(ref, { open: true, onClose: vi.fn() }))

    expect(() => fireEvent.keyDown(document, { key: 'Tab' })).not.toThrow()
  })
})
