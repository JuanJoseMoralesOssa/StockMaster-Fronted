import { X, LogOut } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import useAuthStore from '../../../../stores/useAuthStore'
import { Fragment, useEffect, useRef } from 'react'
import { getViewAccentStyle } from '../../../../constants/viewAccents'
import { useGroupedNavItems } from '../../../../hooks/useNavItems'
import { useFocusTrap } from '../../../../hooks/useFocusTrap'

interface NavbarMobileProps {
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const DRAWER_ID = 'mobile-nav-drawer'

const NavbarMobile: React.FC<NavbarMobileProps> = ({ open, setOpen }) => {
    const { logout } = useAuthStore()
    const groupedItems = useGroupedNavItems()
    const drawerRef = useRef<HTMLElement>(null)

    const close = () => setOpen(false)
    useFocusTrap(drawerRef, { open, onClose: close })

    // Lock the page body while the drawer is open so the content behind the
    // scrim doesn't scroll (mirrors Modal.tsx).
    useEffect(() => {
        if (!open) return
        const prevOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = prevOverflow }
    }, [open])

    if (!open) return null

    return (
        <section>
            {open && (
                <section
                    id={DRAWER_ID}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Menú de navegación"
                    className='fixed inset-0 z-50 flex'
                >
                    <section ref={drawerRef} className='flex h-full w-64 flex-col border-r border-(--color-sidebar-border) bg-(--color-sidebar-bg) shadow-xl animate-slide-left pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]'>
                        <section className='flex h-16 items-center justify-between border-b border-(--color-sidebar-border) px-4'>
                            <div className='flex items-center gap-2.5'>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-logo-from to-logo-to text-sm font-bold shadow-sm">
                                    📦
                                </div>
                                <h1 className='text-base font-bold tracking-tight text-(--color-sidebar-text-strong)'>
                                StockMaster
                                </h1>
                            </div>
                            <button
                                id="mobile-menu-close-btn"
                                aria-label="Cerrar menú"
                                onClick={() => setOpen(false)}
                                className='rounded-lg p-1.5 text-(--color-sidebar-text-muted) transition-colors duration-200 ease-in-out hover:bg-(--color-sidebar-hover) hover:text-(--color-sidebar-text-strong) focus:outline-none focus:ring-2 focus:ring-(--view-accent,var(--color-focus-ring))'>
                                <X className='h-5 w-5' />
                            </button>
                        </section>
                        <nav aria-label='Navegación principal' className='flex-1 space-y-1 overflow-y-auto p-3'>
                            {groupedItems.map(([category, items], index) => (
                                <Fragment key={category}>
                                    <p className={`px-2.5 pb-1 text-xs font-semibold uppercase tracking-[0.8px] text-(--color-sidebar-text-muted) ${index > 0 ? 'mt-4' : 'mt-1'}`}>
                                        {category}
                                    </p>
                                    {items.map((item) => (
                                        <NavLink
                                            key={item.href}
                                            id={`nav-mobile-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                                            to={item.href}
                                            style={getViewAccentStyle(item.accent)}
                                            onClick={() => setOpen(false)}
                                            className={({ isActive }) =>
                                                'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-(--view-accent) ' +
                                                (isActive
                                                    ? 'bg-(--nav-accent-bg) text-(--color-sidebar-text-strong) shadow-[0_0_0_1px_var(--nav-accent-ring)]'
                                                    : 'text-(--color-sidebar-text) hover:bg-(--color-sidebar-hover) hover:text-(--color-sidebar-text-strong)')
                                            }>
                                            {({ isActive }) => (
                                                <>
                                                    <span className="flex w-4.5 items-center justify-center opacity-80">
                                                        {item.icon}
                                                    </span>
                                                    <span className="flex-1">{item.title}</span>
                                                    {isActive && (
                                                        <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-(--nav-accent-dot) shadow-[0_0_0_3px_var(--nav-accent-ring)]" />
                                                    )}
                                                </>
                                            )}
                                        </NavLink>
                                    ))}
                                </Fragment>
                            ))}
                        </nav>
                        <section className='border-t border-(--color-sidebar-border) p-3'>
                            <button
                                id="mobile-logout-btn"
                                aria-label="Cerrar sesión"
                                onClick={() => {
                                    setOpen(false)
                                    logout()
                                }}
                                className='flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-(--color-sidebar-text-muted) transition-colors hover:bg-danger-500/10 hover:text-danger-500 focus:outline-none focus:ring-2 focus:ring-(--view-accent,var(--color-focus-ring))'>
                                <LogOut className='h-5 w-5' />
                                Cerrar Sesión
                            </button>
                        </section>
                    </section>
                    <button
                        id="mobile-menu-overlay"
                        aria-label="Cerrar menú (fondo)"
                        className='flex-1 bg-black/60 focus:outline-none animate-backdrop'
                        onClick={() => setOpen(false)}
                    />
                </section>
            )}
        </section>
    )
}

export default NavbarMobile
