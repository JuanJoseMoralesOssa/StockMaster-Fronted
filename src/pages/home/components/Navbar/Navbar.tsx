import { useEffect, useState } from 'react'
import NavbarDesktop from './NavbarDesktop'
import { LogOut, Menu, X } from 'lucide-react'
import NavbarMobile from './NavbarMobile'
import useAuthStore from '../../../../stores/useAuthStore'

function Navbar() {
    const { logout } = useAuthStore()
    const [open, setOpen] = useState(false)

    const [windowDimensions, setWindowDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    })

    const detectWindowDimensions = () => {
        if (windowDimensions.width >= 768) {
            setOpen(false)
        }
        setWindowDimensions({
            width: window.innerWidth,
            height: window.innerHeight,
        })
    }

    useEffect(() => {
        window.addEventListener('resize', detectWindowDimensions)
        return () => {
            window.removeEventListener('resize', detectWindowDimensions)
        }
    }, [windowDimensions.width])

    return (
        <section className='flex flex-col md:flex-row w-fit min-h-screen justify-between bg-gray-50'>
            <section
                className={
                    'flex min-h-screen justify-between ' +
                    (open ? ' fixed inset-0 z-50' : '')
                }>
                {!open ? (
                    <Menu
                        className='h-6 w-6 fixed top-4 right-4 md:hidden'
                        onClick={() => setOpen(true)}
                    />
                ) : (
                    <X
                        className='h-6 w-6 fixed top-4 right-4 bg-gray-200 hover:bg-gray-400 rounded-full p-1 transition-colors duration-200 ease-in-out'
                        onClick={() => setOpen(false)}
                    />
                )}
            </section>
            {
                /* Sidebar for desktop */
                windowDimensions.width >= 768 ? (
                    <aside className='hidden md:flex w-44 flex-col relative'>
                        <section className='flex flex-col flex-grow border-r bg-gray-50 h-screen'>
                            <section className='flex items-center h-16 pl-4 pr-2 border-b bg-white'>
                                <p className='text-xl font-semibold'>
                                    StockMaster
                                </p>
                            </section>
                            <NavbarDesktop></NavbarDesktop>
                            <section className='p-2 border-t hover:bg-gray-300  cursor-pointer'>
                                <button
                                    onClick={logout}
                                    className='w-full justify-start gap-2 flex p-1 items-center border rounded-lg border-gray-50 hover:bg-gray-600 hover:border-gray-800'
                                >
                                    <LogOut className='h-5 w-5' />
                                    Cerrar Sesión
                                </button>
                            </section>
                        </section>
                    </aside>
                ) : (
                    open && (
                        /* Mobile navigation */
                        <NavbarMobile open={open} setOpen={setOpen}></NavbarMobile>
                    )
                )
            }
        </section>
    )
}

export default Navbar
