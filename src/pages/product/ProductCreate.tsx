import { useState } from 'react'
import Product from '../../types/Product'
import { productService } from '../../services/ProductService'
import { useApiRequest } from '../../hooks/useApiRequest'
import { Button, FieldGroup, Input } from '../../components/ui'

interface ProductCreateProps {
    onSuccess?: () => void
    onProductCreated?: (newProduct: Product) => void
}

const ProductCreate = ({ onSuccess, onProductCreated }: ProductCreateProps) => {
    const [product, setProduct] = useState<Product>({
        name: '',
        stock: 0,
        code: '',
    } as Product)

    const { loading, execute } = useApiRequest(
        (data: Partial<Product>) => productService.create(data),
        {
            successMessage: 'Producto creado exitosamente',
            errorMessage: 'Error al crear el producto',
            showSuccessToast: true,
            onSuccess: (newProduct) => {
                if (onProductCreated) {
                    onProductCreated(newProduct)
                }
                setProduct({
                    name: '',
                    stock: 0,
                    code: '',
                } as Product)
                if (onSuccess) {
                    onSuccess()
                }
            }
        }
    )

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setProduct({ ...product, [name]: value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await execute(product)
    }

    return (
        <form onSubmit={handleSubmit} className='space-y-4 px-2 overflow-auto' noValidate>
            <FieldGroup label='Nombre del producto' required>
                <Input
                    type='text'
                    name='name'
                    value={product.name}
                    onChange={handleChange}
                    placeholder='Ingresa el nombre del producto'
                    required
                />
            </FieldGroup>

            <section className='flex w-full sm:justify-end'>
                <Button type='submit' loading={loading} variant='primary' className='w-full md:w-fit'>
                    Guardar
                </Button>
            </section>
        </form>
    )
}

export default ProductCreate
