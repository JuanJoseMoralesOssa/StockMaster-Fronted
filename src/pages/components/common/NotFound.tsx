import { Link } from 'react-router-dom'

function NotFound() {
    return (
        <section className='bg-(--color-bg-page)'>
            <section className='mx-auto grid min-h-[70dvh] max-w-7xl place-content-center px-4 py-8 lg:px-6 lg:py-16'>
                <section className='mx-auto max-w-2xl text-center'>
                    <h1 className='mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-brand-600'>
                        404
                    </h1>
                    <p className='mb-4 text-3xl tracking-tight font-bold text-(--color-text-primary) md:text-4xl'>
                        Falta algo.
                    </p>
                    <p className='mb-4 text-lg font-light text-(--color-text-secondary)'>
                        Lo sentimos, no encontramos esa página. Encontrarás mucho que
                        explorar en la página de inicio.{' '}
                    </p>
                    <Link
                        to='/'
                        className='inline-flex items-center justify-center my-4 px-5 py-2.5 rounded-lg text-sm font-medium bg-(--color-action-bg) text-(--color-action-text) hover:bg-(--color-action-bg-hover) transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus-ring)'>
                        Volver a la página de inicio
                    </Link>
                </section>
            </section>
        </section>
    )
}

export default NotFound
