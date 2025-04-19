import Navbar from './Navbar/Navbar'

export function DashboardLayout({ children }: { readonly children: React.ReactNode }) {
    return (
        <section className='flex justify-between min-h-screen min-w-screen'>
            <Navbar></Navbar>
            {/* Main content */}
            <main className='flex-1 md:pl-64'>{children}</main>
        </section>
    )
}
