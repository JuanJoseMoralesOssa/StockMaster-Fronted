import { useState } from 'react'
import Product from '../../../types/Product'
import { productService } from '../../../services/ProductService'

// const createProduct = async (product: Product) => {
//     // Create product in the database
//     // const response = await fetch('https://api.example.com/products', {
//     //     method: 'POST',
//     //     headers: {
//     //         'Content-Type': 'application/json',
//     //     },
//     //     body: JSON.stringify(product),
//     // })
//     // const data = await response.json()
//     // return data
//     await new Promise((resolve) => setTimeout(resolve, 3000))
//     console.log('Product created', product)
//     return product
// }

const ProductCreate = () => {
    const [loading, setLoading] = useState(false)
    const [product, setProduct] = useState<Product>({
        name: '',
        stock: 0,
        code: '',
    } as Product)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setProduct({ ...product, [name]: value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        await productService.create(product).then((response) => {
            console.log('Product created', response)
            alert('Producto creado')
            window.location.reload()
        }).catch((error) => {
            console.error('Error al crear el Producto', error)
            alert('Error al crear el Productos')
        })
        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className='space-y-4 px-2 overflow-auto'>
            <section className='md:flex md:items-center md:justify-evenly space-y-4 md:space-y-0 md:space-x-4'>
                <section className='md:flex md:items-center md:justify-between md:space-x-4'>
                    <label
                        htmlFor='name'
                        className='block text-sm font-medium text-gray-700 md:w-1/3'>
                        Nombre
                    </label>
                    <input
                        type='text'
                        name='name'
                        id='name'
                        value={product.name}
                        required
                        onChange={handleChange}
                        className='mt-1 p-1 block border w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:outline-none focus:ring-indigo-500 sm:text-sm md:w-full'
                    />
                </section>
                <section className='md:w-1/2 md:flex md:items-center md:justify-evenly md:space-x-4'>
                    <label
                        htmlFor='code'
                        className='block text-sm font-medium text-gray-700 md:w-1/2'>
                        Código
                    </label>
                    <input
                        type='text'
                        name='code'
                        id='code'
                        value={product.code}
                        onChange={handleChange}
                        className='mt-1 p-1 block border w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:outline-none focus:ring-indigo-500 sm:text-sm md:w-1/2'
                    />
                </section>
            </section>
            <section className='flex w-full sm:justify-end'>
                <button
                    disabled={loading}
                    type='submit'
                    className='inline-flex w-full md:w-fit justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                    Guardar
                </button>
            </section>
        </form>
    )
}

export default ProductCreate
