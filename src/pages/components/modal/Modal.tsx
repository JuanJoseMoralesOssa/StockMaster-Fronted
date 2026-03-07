import { ReactNode, useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
    open: boolean
    onClose: () => void
    title?: string
    description?: string
    children: ReactNode
    className?: string
}

export const Modal = ({
    open,
    onClose,
    title,
    description,
    children,
    className = 'sm:max-w-fit '
}: ModalProps) => {
    const closeButtonRef = useRef<HTMLButtonElement>(null)

    // Lock body scroll and focus the close button when modal opens
    useEffect(() => {
        if (!open) return
        const prevOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        closeButtonRef.current?.focus()
        return () => {
            document.body.style.overflow = prevOverflow
        }
    }, [open])

    // Focus trap + Escape key handler
    useEffect(() => {
        if (!open) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
                return
            }
            if (e.key !== 'Tab') return

            const modal = document.getElementById('modal-dialog')
            if (!modal) return

            const focusableSelectors = [
                'a[href]',
                'button:not([disabled])',
                'textarea:not([disabled])',
                'input:not([disabled])',
                'select:not([disabled])',
                '[tabindex]:not([tabindex="-1"])',
            ].join(', ')

            const focusableEls = Array.from(
                modal.querySelectorAll<HTMLElement>(focusableSelectors)
            )
            const firstEl = focusableEls[0]
            const lastEl = focusableEls[focusableEls.length - 1]

            if (e.shiftKey) {
                if (document.activeElement === firstEl) {
                    e.preventDefault()
                    lastEl?.focus()
                }
            } else {
                if (document.activeElement === lastEl) {
                    e.preventDefault()
                    firstEl?.focus()
                }
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [open, onClose])

    if (!open) return null

    return (
        <div className='fixed inset-0 z-50 h-screen w-screen flex items-center justify-center'>
            <div
                id="modal-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? 'modal-title' : undefined}
                className={`relative bg-white dark:bg-slate-800 p-6 rounded shadow-lg w-full ${className} m-auto animate-modal-in`}
            >
                <div className='overflow-y-auto max-h-[95vh]'>
                    {/* Header */}
                    {(title || description) && (
                        <div className='mb-4'>
                            {title && (
                                <h2 id="modal-title" className='text-xl font-semibold dark:text-white'>
                                    {title}
                                </h2>
                            )}
                            {description && (
                                <p className='text-gray-600 dark:text-slate-400'>{description}</p>
                            )}
                        </div>
                    )}

                    {/* Content */}
                    {children}
                </div>

                {/* Close Button — receives initial focus for accessibility */}
                <button
                    ref={closeButtonRef}
                    onClick={onClose}
                    aria-label="Cerrar diálogo"
                    className='absolute top-2 right-2 bg-gray-200 hover:bg-gray-400 dark:bg-slate-600 dark:hover:bg-slate-500 rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                    <X className='h-5 w-5' />
                </button>
            </div>

            {/* Backdrop — div, not button, so it stays out of tab order */}
            <div
                className='fixed inset-0 bg-black -z-50 cursor-pointer animate-backdrop'
                onClick={onClose}
                aria-hidden="true"
            />
        </div>
    )
}
