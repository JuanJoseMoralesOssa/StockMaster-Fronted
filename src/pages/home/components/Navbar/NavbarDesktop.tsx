import { NavLink, useLocation } from 'react-router'
import NavItem from '../../../../types/NavItem'
import navItems from '../../../../constants/NavItems'

function NavbarDesktop() {
    let location = useLocation().pathname
    return (
        <nav className='flex-1 space-y-0.5 px-4 overflow-y-auto'>
            {navItems.map((item: NavItem) => (
                <NavLink
                    key={item.href}
                    to={item.href}
                    className='flex items-center rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900'>
                    <span
                        className={
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900' +
                            (location === item.href
                                ? 'bg-gray-100 text-gray-900'
                                : '')
                        }>
                        {item.icon}
                        {item.title}
                    </span>
                </NavLink>
            ))}
        </nav>
    )
}

export default NavbarDesktop
