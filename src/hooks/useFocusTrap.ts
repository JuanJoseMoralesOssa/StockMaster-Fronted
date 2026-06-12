import { useEffect, type RefObject } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

interface FocusTrapOptions {
  open: boolean
  onClose: () => void
}

/**
 * Traps Tab focus within `ref` while `open`, and calls `onClose` on Escape.
 * Used by overlay surfaces (modal dialog, mobile nav drawer).
 */
export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  { open, onClose }: FocusTrapOptions
) {
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return

      const container = ref.current
      if (!container) return

      const focusableEls = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      )
      if (focusableEls.length === 0) return

      const firstEl = focusableEls[0]
      const lastEl = focusableEls[focusableEls.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault()
          lastEl.focus()
        }
      } else if (document.activeElement === lastEl) {
        e.preventDefault()
        firstEl.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [ref, open, onClose])
}
