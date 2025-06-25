import Navbar from './Navbar/Navbar'

export function DashboardLayout({ children }: { readonly children: React.ReactNode }) {
    return (
        <section className='flex justify-between min-h-screen min-w-screen'>
            <Navbar></Navbar>
            <main className='flex-1'>{children}</main>
        </section>
    )
}
