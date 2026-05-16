import { Menu, X, LogOut } from 'lucide-react'
import { NavLink } from 'react-router'
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
        <section className='bg-'>
            {!open && (
                <button
                    id="mobile-menu-open-btn-fallback"
                    onClick={() => setOpen(!open)}
                    aria-label="Abrir menú"
                    className='lg:hidden fixed top-4 left-4 p-2 bg-transparent rounded focus:outline-none focus:ring-2 focus:ring-blue-500'>
                    <Menu className='h-6 w-6' />
                </button>
            )}
            {open && (
                <section className='fixed inset-0 z-50 flex'>
                    <section className='w-64 bg-white shadow-lg h-full flex flex-col animate-slide-left'>
                        <section className='flex items-center justify-between h-16 px-4 border-b'>
                            <h1 className='text-lg font-semibold'>
                                StockMaster
                            </h1>
                            <button
                                id="mobile-menu-close-btn"
                                aria-label="Cerrar menú"
                                onClick={() => setOpen(false)}
                                className='bg-gray-200 hover:bg-gray-400 rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500'>
                                <X className='h-5 w-5' />
                            </button>
                        </section>
                        <nav className='flex-1 space-y-1 p-4 overflow-y-auto'>
                            {Object.entries(
                                navItems.reduce((acc, item) => {
                                    const cat = item.category || 'General'
                                    if (!acc[cat]) acc[cat] = []
                                    acc[cat].push(item)
                                    return acc
                                }, {} as Record<string, NavItem[]>)
                            ).map(([category, items], index) => (
                                <Fragment key={category}>
                                    <p className={`text-xs font-semibold uppercase tracking-widest text-gray-400 px-2 pb-1 ${index > 0 ? 'mt-4' : 'mt-1'}`}>
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
                                                'flex items-center gap-3 rounded-lg px-3 py-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--view-accent)] ' +
                                                (isActive
                                                    ? 'bg-[var(--view-accent-soft)] text-[var(--view-accent-text)] font-semibold shadow-[inset_3px_0_0_var(--view-accent)]'
                                                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900')
                                            }>
                                            {item.icon}
                                            {item.title}
                                        </NavLink>
                                    ))}
                                </Fragment>
                            ))}
                        </nav>
                        <section className='p-4 border-t'>
                            <button
                                id="mobile-logout-btn"
                                aria-label="Cerrar sesión"
                                onClick={() => {
                                    setOpen(false)
                                    logout()
                                }}
                                className='w-full flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500'>
                                <LogOut className='h-5 w-5' />
                                Cerrar Sesión
                            </button>
                        </section>
                    </section>
                    <button
                        id="mobile-menu-overlay"
                        aria-label="Cerrar menú (fondo)"
                        className='flex-1 bg-black opacity-50 focus:outline-none animate-backdrop'
                        onClick={() => setOpen(false)}
                    />
                </section>
            )}
        </section>
    )
}

export default NavbarMobile
