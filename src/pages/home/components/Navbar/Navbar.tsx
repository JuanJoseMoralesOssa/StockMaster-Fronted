import NavbarDesktop from './NavbarDesktop'
import { LogOut } from 'lucide-react'
import NavbarMobile from './NavbarMobile'
import useAuthStore from '../../../../stores/useAuthStore'
import { useState } from 'react'

function Navbar() {
    const { logout } = useAuthStore()
    const [open, setOpen] = useState(false)

    return (
        <>
            {/* Mobile nav — visible only on small screens, controlled by CSS not JS */}
            <div className='md:hidden'>
                <NavbarMobile open={open} setOpen={setOpen} />
            </div>

            {/* Desktop sidebar — visible only on md+ screens */}
            <aside className='hidden md:flex w-55 flex-col relative'>
                <section className='flex flex-col grow border-r border-(--color-sidebar-border) bg-(--color-sidebar-bg) h-screen'>
                    <section className='flex items-center gap-2.5 py-5.5 px-5 border-b border-(--color-sidebar-border)'>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[15px] font-bold bg-linear-to-br from-blue-600 to-purple-500 shadow-sm">
                            📦
                        </div>
                        <p className='text-[16px] font-bold text-(--color-sidebar-text-strong) tracking-tight'>
                            StockMaster
                        </p>
                    </section>
                    <NavbarDesktop />
                    <section className='p-3 border-t border-(--color-sidebar-border)'>
                        <button
                            id="desktop-logout-btn"
                            aria-label="Cerrar sesión"
                            onClick={logout}
                            className='w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium text-(--color-sidebar-text-muted) hover:bg-danger-500/10 hover:text-danger-500 transition-colors focus:outline-none focus:ring-2 focus:ring-(--view-accent,var(--color-focus-ring))'
                        >
                            <LogOut className='h-4.5 w-4.5' />
                            Cerrar Sesión
                        </button>
                    </section>
                </section>
            </aside>
        </>
    )
}

export default Navbar
