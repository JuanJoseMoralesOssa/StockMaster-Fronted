import { Trash2 } from 'lucide-react'
import PurchaseDetails from '../../../types/PurchaseDetails'
import Product from '../../../types/Product'
import Person from '../../../types/Person'

interface PurchaseRowProps {
    purchase: PurchaseDetails
    onUpdate: (id: number, field: string, value: any) => void
    onDelete: (id: number) => void
    products: Partial<Product>[]
    suppliers: Person[]
}

const PurchaseRow: React.FC<PurchaseRowProps> = ({
    purchase,
    onUpdate,
    onDelete,
    products,
    suppliers,
}) => {
    const handleProductChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        if (purchase.id) {
            onUpdate(purchase.id, 'product', {
                id: parseInt(event.target.value, 10),
                name: event.target.options[event.target.selectedIndex].text,
            })
        }
    }

    const handleSupplierChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        if (purchase.id) {
            onUpdate(purchase.id, 'person', {
                id: parseInt(event.target.value, 10),
                name: event.target.options[event.target.selectedIndex].text,
            })
        }
    }

    const handleNumberInputChange =
        (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
            if (purchase.id) {
                let value = parseFloat(e.target.value) || 0
                if (value < 0) {
                    value = 0
                }
                onUpdate(purchase.id, field, (value == 0 ? '' : value))
            }
        }

    return (
        <tr className='text-sm sm:text-base' key={purchase.id}>
            <td className='p-2 whitespace-nowrap'>
                <select
                    value={purchase.product?.id ?? purchase.productId}
                    onChange={handleProductChange}
                    required>
                    <option value=''>Selecciona un producto</option>
                    {products.map((product) => (
                        <option key={product.id} value={product.id}>
                            {product.name}
                        </option>
                    ))}
                </select>
            </td>
            <td className='p-2 whitespace-nowrap'>
                <select
                    value={purchase.person?.id ?? purchase.personId}
                    onChange={handleSupplierChange}
                    required>
                    <option value=''>Selecciona un proveedor</option>
                    {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                            {supplier.name}
                        </option>
                    ))}
                </select>
            </td>
            <td className='p-2 whitespace-nowrap'>
                <input
                    type='number'
                    className='w-24 h-8 text-sm text-center mt-1 p-1 block border rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:outline-none focus:ring-indigo-500'
                    name='weight_kg'
                    id={`weight_kg_${purchase.id}`}
                    value={purchase.weight_kg ?? ''}
                    min={0}
                    step='0.001'
                    required
                    onChange={handleNumberInputChange('weight_kg')}
                />
            </td>
            <td className='text-center p-2'>
                <button
                    type='button'
                    className='text-red-600'
                    onClick={() => purchase.id && onDelete(purchase.id)}>
                    <Trash2 className='w-4 h-4' />
                </button>
            </td>
        </tr>
    )
}

export default PurchaseRow
