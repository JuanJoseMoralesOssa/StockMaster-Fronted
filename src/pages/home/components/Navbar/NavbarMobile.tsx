import { Menu, X, LogOut } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import navItems from '../../../../constants/NavItems'
import useAuthStore from '../../../../stores/useAuthStore'
import NavItem from '../../../../types/NavItem'
import { Fragment } from 'react'
import { getViewAccentStyle } from '../../../../constants/viewAccents'

interface NavbarMobileProps {
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const NavbarMobile: React.FC<NavbarMobileProps> = ({ open, setOpen }) => {
    const { logout } = useAuthStore()
    return (
        <section>
            {!open && (
                <button
                    id="mobile-menu-open-btn-fallback"
                    onClick={() => setOpen(!open)}
                    aria-label="Abrir menú"
                    className='fixed left-4 top-4 z-40 rounded-lg border border-(--color-border) bg-(--color-bg-surface) p-2 text-(--view-accent,var(--color-text-primary)) shadow-sm transition-colors hover:bg-(--color-bg-subtle) focus:outline-none focus:ring-2 focus:ring-(--view-accent,var(--color-focus-ring)) md:hidden'>
                    <Menu className='h-6 w-6' />
                </button>
            )}
            {open && (
                <section className='fixed inset-0 z-50 flex'>
                    <section className='flex h-full w-64 flex-col border-r border-(--color-sidebar-border) bg-(--color-sidebar-bg) shadow-xl animate-slide-left'>
                        <section className='flex h-16 items-center justify-between border-b border-(--color-sidebar-border) px-4'>
                            <div className='flex items-center gap-2.5'>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-purple-500 text-[15px] font-bold shadow-sm">
                                    📦
                                </div>
                                <h1 className='text-[16px] font-bold tracking-tight text-(--color-sidebar-text-strong)'>
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
                        <nav className='flex-1 space-y-1 overflow-y-auto p-3'>
                            {Object.entries(
                                navItems.reduce((acc, item) => {
                                    const cat = item.category || 'General'
                                    if (!acc[cat]) acc[cat] = []
                                    acc[cat].push(item)
                                    return acc
                                }, {} as Record<string, NavItem[]>)
                            ).map(([category, items], index) => (
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
                                                'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-(--view-accent) ' +
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
                                className='flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium text-(--color-sidebar-text-muted) transition-colors hover:bg-danger-500/10 hover:text-danger-500 focus:outline-none focus:ring-2 focus:ring-(--view-accent,var(--color-focus-ring))'>
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
