import { Menu } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { DRAWER_ID } from './NavbarMobile'

interface MobileTopBarProps {
    open: boolean
    onOpenNav: () => void
    /** Active section name, shown so users keep their place when the sidebar is hidden. */
    title?: string
}

/**
 * Sticky in-flow app bar for mobile (`md:hidden`). Hosts the nav trigger and the
 * brand, so page content never sits under a floating button. Restores focus to the
 * trigger when the drawer closes.
 */
export default function MobileTopBar({ open, onOpenNav, title }: MobileTopBarProps) {
    const triggerRef = useRef<HTMLButtonElement>(null)

    // Restore focus to the trigger on a drawer open→closed transition (not on mount).
    const wasOpen = useRef(false)
    useEffect(() => {
        if (wasOpen.current && !open) triggerRef.current?.focus()
        wasOpen.current = open
    }, [open])

    return (
        <header className='sticky top-0 z-30 flex min-h-14 items-center gap-3 border-b border-(--color-border) bg-(--color-bg-surface) px-4 pt-[env(safe-area-inset-top)] shadow-xs md:hidden'>
            <button
                ref={triggerRef}
                id="mobile-nav-trigger"
                onClick={onOpenNav}
                aria-label="Abrir menú"
                aria-expanded={open}
                aria-controls={DRAWER_ID}
                className='flex h-11 w-11 -ml-2 items-center justify-center rounded-lg text-(--view-accent,var(--color-text-primary)) transition-colors hover:bg-(--color-bg-subtle) focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--view-accent,var(--color-focus-ring))'
            >
                <Menu className='h-6 w-6' />
            </button>
            <div className='flex min-w-0 items-center gap-2'>
                <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-logo-from to-logo-to text-xs shadow-sm'>
                    📦
                </div>
                <span className='truncate text-base font-bold tracking-tight text-(--color-text-primary)'>
                    {title ?? 'StockMaster'}
                </span>
            </div>
        </header>
    )
}
