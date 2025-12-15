import { ReactNode } from 'react'
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
    if (!open) return null

    return (
        <section className='fixed inset-0 z-50 h-screen w-screen flex items-center justify-center'>
            <section className={`relative bg-white p-6 rounded shadow-lg w-full ${className} m-auto`}>
                <section className='overflow-y-auto max-h-[95vh]'>
                    {/* Header */}
                    {(title || description) && (
                        <section className='mb-4'>
                            {title && <h2 className='text-xl font-semibold'>{title}</h2>}
                            {description && <p className='text-gray-600'>{description}</p>}
                        </section>
                    )}

                    {/* Content */}
                    {children}
                </section>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className='absolute top-2 right-2 bg-gray-200 hover:bg-gray-400 rounded-full p-1 transition-colors duration-200 ease-in-out'>
                    <X className='h-5 w-5' />
                </button>
            </section>

            {/* Backdrop */}
            <button
                className='fixed inset-0 bg-black opacity-50 -z-50'
                onClick={onClose}
            />
        </section>
    )
}
