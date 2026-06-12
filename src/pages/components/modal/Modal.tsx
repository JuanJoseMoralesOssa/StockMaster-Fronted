import { ReactNode, useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../../lib/utils'
import { useFocusTrap } from '../../../hooks/useFocusTrap'

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
    className = 'sm:max-w-lg'
}: ModalProps) => {
    const dialogRef = useRef<HTMLDivElement>(null)
    const closeButtonRef = useRef<HTMLButtonElement>(null)
    const titleId = useId()
    const descId = useId()

    // Lock body scroll, focus the close button, and restore focus to the
    // triggering element when the modal closes.
    useEffect(() => {
        if (!open) return
        const prevFocused = document.activeElement as HTMLElement | null
        const prevOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        closeButtonRef.current?.focus()
        return () => {
            document.body.style.overflow = prevOverflow
            prevFocused?.focus()
        }
    }, [open])

    useFocusTrap(dialogRef, { open, onClose })

    if (!open) return null

    return (
        <div className='fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4'>
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? titleId : undefined}
                aria-describedby={description ? descId : undefined}
                className={cn(
                    'relative m-auto w-full max-w-none rounded-t-2xl bg-(--color-bg-surface) p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-lg animate-modal-in',
                    'sm:max-w-[calc(100vw-2rem)] sm:rounded-lg sm:p-6 sm:pb-6',
                    className
                )}
            >
                <div className='overflow-y-auto max-h-[80vh] sm:max-h-[calc(100vh-2rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))]'>
                    {/* Header */}
                    {(title || description) && (
                        <div className='mb-4 pr-10'>
                            {title && (
                                <h2 id={titleId} className='text-xl font-semibold text-(--color-text-primary)'>
                                    {title}
                                </h2>
                            )}
                            {description && (
                                <p id={descId} className='text-(--color-text-secondary)'>{description}</p>
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
                    className='absolute top-3 right-3 flex h-9 w-9 items-center justify-center bg-(--color-bg-subtle) hover:bg-(--color-bg-muted) rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-(--color-focus-ring)'
                >
                    <X className='h-5 w-5' />
                </button>
            </div>

            {/* Backdrop — div, not button, so it stays out of tab order */}
            <div
                className='fixed inset-0 bg-black/50 -z-50 cursor-pointer animate-backdrop'
                onClick={onClose}
                aria-hidden="true"
            />
        </div>
    )
}
