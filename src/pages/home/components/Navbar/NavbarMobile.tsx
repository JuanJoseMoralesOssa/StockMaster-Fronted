import { Menu, X, LogOut } from 'lucide-react'
import { NavLink, useLocation } from 'react-router'
import navItems from '../../../../constants/NavItems'

interface NavbarMobileProps {
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const NavbarMobile: React.FC<NavbarMobileProps> = ({ open, setOpen }) => {
    let location = useLocation().pathname
    return (
        <section className='bg-'>
            {!open && (
                <button
                    onClick={() => setOpen(!open)}
                    className='lg:hidden fixed top-4 left-4 p-2 bg-transparent'>
                    <Menu className='h-6 w-6' />
                </button>
            )}
            {open && (
                <section className='fixed inset-0 z-50 flex'>
                    <section className='w-64 bg-white shadow-lg h-full flex flex-col'>
                        <section className='flex items-center justify-between h-16 px-4 border-b'>
                            <h1 className='text-lg font-semibold'>
                                StockMaster
                            </h1>
                            <button
                                onClick={() => setOpen(false)}
                                className='bg-gray-200 hover:bg-gray-400 rounded-full p-1 transition-colors duration-200 ease-in-out'>
                                <X className='h-5 w-5' />
                            </button>
                        </section>
                        <nav className='flex-1 space-y-1 p-4 overflow-y-auto'>
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.href}
                                    to={item.href}
                                    onClick={() => setOpen(false)}>
                                    <p
                                        className={
                                            'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900' +
                                            (location === item.href
                                                ? 'bg-gray-100 text-gray-900'
                                                : '')
                                        }>
                                        {item.icon}
                                        {item.title}
                                    </p>
                                </NavLink>
                            ))}
                        </nav>
                        <section className='p-4 border-t'>
                            <button
                                onClick={() => setOpen(false)}
                                className='w-full flex items-center gap-2 p-2 border rounded-lg'>
                                <LogOut className='h-5 w-5' />
                                Cerrar Sesión
                            </button>
                        </section>
                    </section>
                    <button
                        // backdrop-filter backdrop-blur-xl
                        className='flex-1 bg-black opacity-50 '
                        onClick={() => setOpen(false)}
                    />
                </section>
            )}
        </section>
    )
}

export default NavbarMobile
