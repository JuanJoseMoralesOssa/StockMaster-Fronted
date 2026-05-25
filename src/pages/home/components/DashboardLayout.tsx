import Navbar from './Navbar/Navbar'
import { useLocation } from 'react-router-dom'
import navItems from '../../../constants/NavItems'
import { getViewAccentStyle } from '../../../constants/viewAccents'

function getActiveNavItem(pathname: string) {
    return navItems
        .filter((item) => item.href === '/' ? pathname === '/' : pathname.startsWith(item.href))
        .sort((a, b) => b.href.length - a.href.length)[0]
}

export function DashboardLayout({ children }: { readonly children: React.ReactNode }) {
    const { pathname } = useLocation()
    const activeItem = getActiveNavItem(pathname)
    const viewStyle = getViewAccentStyle(activeItem?.accent)

    return (
        <section className='flex justify-between min-h-screen bg-(--color-bg-page) text-(--color-text-primary) transition-colors duration-200'>
            {/* Skip-to-content link for keyboard users */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-(--color-action-bg) focus:text-white focus:rounded focus:shadow-lg"
            >
                Ir al contenido principal
            </a>
            <Navbar />
            <main id="main-content" className='min-w-0 flex-1' style={viewStyle}>{children}</main>
        </section>
    )
}
