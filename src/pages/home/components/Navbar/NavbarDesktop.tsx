import { NavLink } from 'react-router-dom' // Ensure using react-router-dom
import { Fragment } from 'react'
import type NavItem from '../../../../types/NavItem'
import { getViewAccentStyle } from '../../../../constants/viewAccents'
import { useNavItems } from '../../../../hooks/useNavItems'

function NavbarDesktop() {
    const navItems = useNavItems()
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
                        <div className={`text-xs font-semibold uppercase tracking-[0.8px] text-(--color-sidebar-text-muted) px-2.5 pb-1 ${index > 0 ? 'mt-4' : 'mt-1'}`}>
                            {category}
                        </div>
                        {items.map((item: NavItem) => (
                            <NavLink
                                key={item.href}
                                id={`nav-desktop-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                                to={item.href}
                                style={getViewAccentStyle(item.accent)}
                                className={({ isActive }) =>
                                    'flex items-center gap-2.5 px-3 py-2.25 rounded-lg text-[13.5px] font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-(--view-accent) ' +
                                    (isActive
                                        ? 'bg-(--nav-accent-bg) text-(--color-sidebar-text-strong) shadow-[0_0_0_1px_var(--nav-accent-ring)]'
                                        : 'text-(--color-sidebar-text) hover:bg-(--color-sidebar-hover) hover:text-(--color-sidebar-text-strong)')
                                }>
                                {({ isActive }) => (
                                    <>
                                        <div className="flex items-center justify-center w-4.5 text-center opacity-80">
                                            {item.icon}
                                        </div>
                                        <span className="flex-1">{item.title}</span>
                                        {isActive && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-(--nav-accent-dot) shadow-[0_0_0_3px_var(--nav-accent-ring)] ml-auto shrink-0"></span>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </Fragment>
                ))}
            </nav>
        </>
    )
}

export default NavbarDesktop
