import { ReactNode } from 'react'

interface DropdownMenuProps {
    children: ReactNode
}

export const DropdownMenu = ({ children }: DropdownMenuProps) => {
    return <section className='relative'>{children}</section>
}

interface DropdownMenuTriggerProps {
    className?: string
    children: ReactNode
    onClick: () => void
}

export const DropdownMenuTrigger = ({
    className,
    children,
    onClick,
}: DropdownMenuTriggerProps) => {
    return (
        <button onClick={onClick} className={className}>
            {children}
        </button>
    )
}

interface DropdownMenuContentProps {
    className?: string
    children: ReactNode
    isOpen: boolean
}

export const DropdownMenuContent = ({
    className,
    children,
    isOpen,
}: DropdownMenuContentProps) => {
    if (!isOpen) return null

    return (
        <section
            className={`absolute mt-1 top-0 right-1/3 max-w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 h-fit w-fit transform translate-x-1/3 ${className}`}>
            {children}
        </section>
    )
}

interface DropdownMenuItemProps {
    children: ReactNode
    onClick: () => void
    className?: string
    disabled?: boolean
}

export const DropdownMenuItem = ({
    children,
    onClick,
    className,
    disabled,
}: DropdownMenuItemProps) => {
    return (
        <button
            type='button'
            disabled={disabled ?? false}
            onClick={onClick}
            className={`w-full flex items-center text-left px-4 py-2 text-sm hover:bg-gray-100 ${className}`}>
            {children}
        </button>
    )
}
