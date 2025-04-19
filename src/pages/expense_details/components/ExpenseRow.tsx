import { Trash2 } from 'lucide-react'
import ExpenseDetails from '../../../types/ExpenseDetails'
import Product from '../../../types/Product'
import Person from '../../../types/Person'

interface ExpenseRowProps {
    expense: ExpenseDetails
    onUpdate: (id: number, field: string, value: any) => void
    onDelete: (id: number) => void
    availableProducts: Product[]
    availableSuppliers: Person[]
}

const ExpenseRow: React.FC<ExpenseRowProps> = ({
    expense,
    onUpdate,
    onDelete,
    availableProducts,
    availableSuppliers,
}) => {
    const handleProductChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        if (expense.id) {
            onUpdate(expense.id, 'product', {
                id: parseInt(event.target.value, 10),
                name: event.target.options[event.target.selectedIndex].text,
            })
        }
    }

    const handleSupplierChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        if (expense.id) {
            onUpdate(expense.id, 'person', {
                id: parseInt(event.target.value, 10),
                name: event.target.options[event.target.selectedIndex].text,
            })
        }
    }

    const handleNumberInputChange =
        (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
            if (expense.id) {
                let value = parseFloat(e.target.value) || 0
                if (value < 0) {
                    value = 0
                }
                onUpdate(expense.id, field, (value == 0 ? '' : value))
            }
        }

    return (
        <tr className='text-sm sm:text-base' key={expense.id}>
            <td className='p-2 whitespace-nowrap'>
                <select
                    value={expense.product?.id ?? expense.productId}
                    onChange={handleProductChange}
                    required>
                    <option value=''>Selecciona un producto</option>
                    {availableProducts.map((product) => (
                        <option key={product.id} value={product.id}>
                            {product.name}
                        </option>
                    ))}
                </select>
            </td>
            <td className='p-2 whitespace-nowrap'>
                <select
                    value={expense.person?.id ?? expense.personId}
                    onChange={handleSupplierChange}
                    required>
                    <option value=''>Selecciona un proveedor</option>
                    {availableSuppliers.map((proveedor) => (
                        <option key={proveedor.id} value={proveedor.id}>
                            {proveedor.name}
                        </option>
                    ))}
                </select>
            </td>
            <td className='p-2 whitespace-nowrap'>
                <input
                    type='number'
                    className='w-24 h-8 text-sm text-center mt-1 p-1 block border rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:outline-none focus:ring-indigo-500'
                    name='weight_kg'
                    id={`weight_kg_${expense.id}`}
                    value={expense.weight_kg ?? ''}
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
                    onClick={() => expense.id && onDelete(expense.id)}>
                    <Trash2 className='w-4 h-4' />
                </button>
            </td>
        </tr>
    )
}

export default ExpenseRow
