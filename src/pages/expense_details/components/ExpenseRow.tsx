import { Trash2 } from 'lucide-react'
import ExpenseDetails from '../../../types/ExpenseDetails'
import Product from '../../../types/Product'
import Person from '../../../types/Person'
import Autocomplete from '../../components/common/Autocomplete'

interface ExpenseRowProps {
    expense: ExpenseDetails
    onUpdate: (id: number, field: string, value: any) => void
    onDelete: (id: number) => void
    products: Partial<Product>[]
    suppliers: Person[]
}

const ExpenseRow: React.FC<ExpenseRowProps> = ({
    expense,
    onUpdate,
    onDelete,
    products,
    suppliers,
}) => {
    // Transformar datos para el autocomplete
    const productOptions = products
        .filter(product => product.id !== undefined && product.name !== undefined)
        .map(product => ({
            id: product.id!,
            label: product.name!,
            name: product.name!
        }));

    const supplierOptions = suppliers
        .filter(supplier => supplier.id !== undefined)
        .map(supplier => ({
            id: supplier.id!,
            label: supplier.name,
            name: supplier.name
        }));

    // Buscar opciones seleccionadas actuales
    const selectedProduct = productOptions.find(option =>
        option.id.toString() === (expense.product?.id ?? expense.productId)?.toString()
    );
    const selectedSupplier = supplierOptions.find(option =>
        option.id.toString() === (expense.person?.id ?? expense.personId)?.toString()
    );

    // Manejar selección de producto desde autocomplete
    const handleProductSelect = (option: { id: string | number;[key: string]: unknown } | null) => {
        if (expense.id) {
            onUpdate(expense.id, 'product', option ? {
                id: option.id,
                name: option.label,
            } : null)
        }
    }

    // Manejar selección de proveedor desde autocomplete
    const handleSupplierSelect = (option: { id: string | number;[key: string]: unknown } | null) => {
        if (expense.id) {
            onUpdate(expense.id, 'person', option ? {
                id: option.id,
                name: option.label,
            } : null)
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
        <tr className='text-sm sm:text-base items-center odd:bg-white even:bg-gray-50' key={expense.id}>
            <td className='p-2 whitespace-nowrap'>
                <div className="w-48">
                    <Autocomplete
                        options={productOptions}
                        label=""
                        placeholder="Buscar producto..."
                        displayKey="label"
                        initialValue={selectedProduct?.label || ''}
                        onSelect={handleProductSelect}
                        clearable={true}
                        noOptionsText="No se encontraron productos"
                        className="text-sm"
                    />
                </div>
            </td>
            <td className='p-2 whitespace-nowrap'>
                <div className="w-48">
                    <Autocomplete
                        options={supplierOptions}
                        label=""
                        placeholder="Buscar proveedor..."
                        displayKey="label"
                        initialValue={selectedSupplier?.label || ''}
                        onSelect={handleSupplierSelect}
                        clearable={true}
                        noOptionsText="No se encontraron proveedores"
                        className="text-sm"
                    />
                </div>
            </td>
            <td className='p-2 whitespace-nowrap'>
                <input
                    type='number'
                    className='w-24 h-9 text-sm text-center block border rounded-md bg-white border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:outline-none focus:ring-indigo-500'
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
