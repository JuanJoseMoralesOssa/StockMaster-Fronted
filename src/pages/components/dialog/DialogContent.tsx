import { X } from 'lucide-react'
import { ReactNode } from 'react'

interface DialogContentProps {
    children: ReactNode
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    className?: string
}

export const DialogContent = ({
    children,
    open,
    setOpen,
    className,
}: DialogContentProps) => {
    if (!open) return null
    return (
        <section
            className={`fixed inset-0 z-50 h-screen w-screen flex items-center justify-center ${className}`}>
            <section className='relative bg-white p-6 rounded shadow-lg w-full max-w-fit m-auto '>
                <section className='overflow-y-auto max-h-[95vh]'>
                    {children}
                </section>
                <button
                    onClick={() => setOpen(false)}
                    className='absolute top-2 right-2 bg-gray-200 hover:bg-gray-400 rounded-full p-1 transition-colors duration-200 ease-in-out'>
                    <X className='h-5 w-5' />
                </button>
            </section>
            <button
                className='fixed inset-0 bg-black opacity-50 -z-50'
                onClick={() => setOpen(false)}
            />
        </section>
    )
}
