import { useState } from 'react'
import Kardex from '../../../types/Kardex'
import { useAvailableProducts } from '../../../hooks/useAvailableProducts'
import { kardexService } from '../../../services/KardexService'

// const createKardex = async (entry: Kardex) => {
//     // Simulación de creación de entrada en el backend
//     // const response = await fetch('https://api.example.com/kardex', {
//     //     method: 'POST',
//     //     headers: {
//     //         'Content-Type': 'application/json',
//     //     },
//     //     body: JSON.stringify(entry),
//     // })
//     // const data = await response.json()
//     // return data
//     await new Promise((resolve) => setTimeout(resolve, 1000))
//     console.log('Kardex entry created', entry)
//     return entry
// }

const KardexCreate = () => {
    const [isLoading, setIsLoading] = useState(false)
    const {
        products,
        loading: productsLoading,
        error: productsError,
        refreshProducts,
    } = useAvailableProducts()
    const [entry, setEntry] = useState<Kardex>({
        operation: 3, // 1 para entrada, 2 para salida
        input: 0,
        output: 0,
        balance: 0,
        balance_record: true,
        date: (() => {
            const dateObj = new Date()
            dateObj.setMinutes(dateObj.getMinutes() - dateObj.getTimezoneOffset())
            return dateObj.toISOString()
        })(),
        productId: 0,
    })

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target
        setEntry({
            ...entry,
            [name]:
                name === 'operation' || name === 'productId' ? Number(value) : value,
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        await kardexService.create(entry).then((response) => {
            console.log('Kardex entry created', response)
            alert('Entrada de Kardex creada con éxito')
            window.location.reload()
        }).catch((error) => {
            console.error('Error al crear la entrada de Kardex', error)
            alert('Error al crear la entrada de Kardex')
        })
        setIsLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className='space-y-4 px-2 overflow-auto'>
            <section className='md:flex md:items-center md:justify-between md:space-x-4'>
                <label
                    htmlFor='date'
                    className='block text-sm font-medium text-gray-700 md:w-1/3'>
                    Fecha
                </label>
                <input
                    required
                    type='date'
                    name='date'
                    id='date'
                    value={entry.date.split('T')[0]}
                    onChange={(e) =>
                        setEntry({
                            ...entry,
                            date: new Date(e.target.value).toISOString(),
                        })
                    }
                    className='mt-1 p-1 block border w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:outline-none focus:ring-indigo-500 sm:text-sm md:w-full'
                />
            </section>

            <section className='md:flex md:items-center md:justify-between md:space-x-4'>
                <label
                    htmlFor='productId'
                    className='block text-sm font-medium text-gray-700 md:w-1/3'>
                    Producto
                </label>
                <select
                    required
                    name='productId'
                    id='productId'
                    value={entry.productId}
                    onChange={handleChange}
                    className='mt-1 p-1 block border w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:outline-none focus:ring-indigo-500 sm:text-sm md:w-full'>
                    <option value=''>Seleccione un producto</option>
                    {products.map((product) => (
                        <option key={product.id} value={product.id}>
                            {product.name}
                        </option>
                    ))}
                    {productsError && (
                        <option value=''>
                            Error al cargar productos: {productsError.message}
                        </option>
                    )}
                    {productsLoading && (
                        <option value=''>Cargando productos...</option>
                    )}
                </select>
                {productsError && (
                    <button
                        className='ml-2 px-2 py-1 bg-red-100 hover:bg-red-200 rounded-md text-sm'
                        onClick={refreshProducts}>
                        Reintentar
                    </button>
                )}
            </section>

            <section className='md:flex md:items-center md:justify-between md:space-x-4'>
                <label
                    htmlFor='input'
                    className='block text-sm font-medium text-gray-700 md:w-1/3'>
                    Cantidad de Entrada
                </label>
                <input
                    type='number'
                    name='input'
                    id='input'
                    value={entry.input}
                    onChange={(e) =>
                        setEntry({
                            ...entry,
                            input: Number(e.target.value),
                        })
                    }
                    className='mt-1 p-1 block border w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:outline-none focus:ring-indigo-500 sm:text-sm md:w-full'
                />
            </section>
            <section className='md:flex md:items-center md:justify-between md:space-x-4'>
                <label
                    htmlFor='output'
                    className='block text-sm font-medium text-gray-700 md:w-1/3'>
                    Cantidad de Salida
                </label>
                <input
                    type='number'
                    name='output'
                    id='output'
                    value={entry.output}
                    onChange={(e) =>
                        setEntry({
                            ...entry,
                            output: Number(e.target.value),
                        })
                    }
                    className='mt-1 p-1 block border w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:outline-none focus:ring-indigo-500 sm:text-sm md:w-full'
                />
            </section>

            <section className='md:flex md:items-center md:justify-between md:space-x-4'>
                <label
                    htmlFor='balance'
                    className='block text-sm font-medium text-gray-700 md:w-1/3'>
                    Saldo
                </label>
                <input
                    type='number'
                    name='balance'
                    id='balance'
                    value={entry.output}
                    onChange={(e) =>
                        setEntry({
                            ...entry,
                            balance: Number(e.target.value),
                        })
                    }
                    className='mt-1 p-1 block border w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:outline-none focus:ring-indigo-500 sm:text-sm md:w-full'
                />
            </section>

            <section className='flex w-full sm:justify-end'>
                <button
                    disabled={isLoading}
                    type='submit'
                    className='inline-flex w-full md:w-fit justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                    Guardar
                </button>
            </section>
        </form>
    )
}

export default KardexCreate
