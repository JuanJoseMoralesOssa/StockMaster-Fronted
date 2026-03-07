import { NavLink } from 'react-router-dom' // Ensure using react-router-dom
import NavItem from '../../../../types/NavItem'
import navItems from '../../../../constants/NavItems'
import { Fragment } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '../../../../stores/useThemeStore'

function NavbarDesktop() {
    const { theme, toggleTheme } = useThemeStore()
    // Group items by category
    const groupedItems = navItems.reduce((acc, item) => {
        const category = item.category || 'General'
        if (!acc[category]) {
            acc[category] = []
        }
        acc[category].push(item)
        return acc
    }, {} as Record<string, NavItem[]>)

    return (
        <>
            <nav className='flex-1 flex flex-col gap-0.5 overflow-y-auto w-full p-2.5'>
                {Object.entries(groupedItems).map(([category, items], index) => (
                    <Fragment key={category}>
                        <div className={`text-xs font-semibold uppercase tracking-[0.8px] text-slate-400 px-2.5 pb-1 ${index > 0 ? 'mt-4' : 'mt-1'}`}>
                            {category}
                        </div>
                        {items.map((item: NavItem) => (
                            <NavLink
                                key={item.href}
                                id={`nav-desktop-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                                to={item.href}
                                className={({ isActive }) =>
                                    'flex items-center gap-2.5 px-3 py-2.25 rounded-lg text-[13.5px] font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ' +
                                    (isActive
                                        ? 'bg-blue-600/20 text-white shadow-[0_0_0_1px_rgba(37,99,235,0.1)]'
                                        : 'text-slate-300 hover:bg-white/5 hover:text-white')
                                }>
                                {({ isActive }) => (
                                    <>
                                        <div className="flex items-center justify-center w-4.5 text-center opacity-80">
                                            {item.icon}
                                        </div>
                                        <span className="flex-1">{item.title}</span>
                                        {isActive && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_0_3px_rgba(37,99,235,0.2)] ml-auto shrink-0"></span>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </Fragment>
                ))}
            </nav>

            {/* Dark mode toggle */}
            <div className='px-3 pb-2'>
                <button
                    onClick={toggleTheme}
                    aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                    aria-pressed={theme === 'dark'}
                    className='w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                    {theme === 'dark' ? <Sun className='h-4 w-4' /> : <Moon className='h-4 w-4' />}
                    {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
                </button>
            </div>
        </>
    )
}

export default NavbarDesktop
