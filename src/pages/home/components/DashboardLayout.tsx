import Navbar from './Navbar/Navbar'

export function DashboardLayout({ children }: { readonly children: React.ReactNode }) {
    return (
        <section className='flex justify-between min-h-screen bg-[var(--bg-base)] text-[var(--text-base)] transition-colors duration-200'>
            {/* Skip-to-content link for keyboard users */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded focus:shadow-lg"
            >
                Ir al contenido principal
            </a>
            <Navbar />
            <main id="main-content" className='flex-1'>{children}</main>
        </section>
    )
}
