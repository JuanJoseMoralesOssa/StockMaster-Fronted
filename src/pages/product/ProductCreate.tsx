import { useState } from 'react'
import Product from '../../types/Product'
import { ProductService } from '../../services/ProductService'
import { useToast } from '../../hooks/useToast'

const productService = new ProductService()

interface ProductCreateProps {
    onSuccess?: () => void
    onProductCreated?: (newProduct: Product) => void
}

const ProductCreate = ({ onSuccess, onProductCreated }: ProductCreateProps) => {
    const [loading, setLoading] = useState(false)
    const { showSuccess, showError } = useToast()
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

        try {
            const newProduct = await productService.create(product)

            // Update local state if callback provided
            if (onProductCreated) {
                onProductCreated(newProduct)
            }

            showSuccess('Producto creado exitosamente', 'Creación exitosa')

            // Limpiar formulario después de creación exitosa
            setProduct({
                name: '',
                stock: 0,
                code: '',
            } as Product)

            // Llamar callback si existe (para cerrar modal)
            if (onSuccess) {
                onSuccess()
            }
        } catch (error) {
            showError('Error al crear el producto', 'Error')
            console.error('Error creating product:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className='space-y-4 px-2 overflow-auto'>
            <section className='md:flex md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4'>
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
