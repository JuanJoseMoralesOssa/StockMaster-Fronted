import { Trash2 } from 'lucide-react'
import PurchaseDetails from '../../../types/PurchaseDetails'
import Product from '../../../types/Product'
import Person from '../../../types/Person'
import Autocomplete from '../../components/common/Autocomplete'

type PurchaseUpdateValue =
    | { id: string | number; name: unknown }
    | null
    | number
    | string
interface PurchaseRowProps {
    purchase: PurchaseDetails
    onUpdate: (id: number, field: string, value: PurchaseUpdateValue) => void
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
    // Transformar datos para el autocomplete
    const productOptions = products
        .filter(product => product.id !== undefined && product.name !== undefined)
        .map(product => ({
            id: product.id!,
            label: product.name!,
            name: product.name!
        }))

    const supplierOptions = suppliers
        .filter(supplier => supplier.id !== undefined)
        .map(supplier => ({
            id: supplier.id!,
            label: supplier.name,
            name: supplier.name
        }))

    // Buscar opciones seleccionadas actuales
    const selectedProduct = productOptions.find(option =>
        option.id.toString() === (purchase.product?.id ?? purchase.productId)?.toString()
    )
    const selectedSupplier = supplierOptions.find(option =>
        option.id.toString() === (purchase.person?.id ?? purchase.personId)?.toString()
    )

    // Manejar selección de producto desde autocomplete
    const handleProductSelect = (option: { id: string | number;[key: string]: unknown } | null) => {
        if (purchase.id) {
            onUpdate(purchase.id, 'product', option ? {
                id: option.id,
                name: option.label,
            } : null)
        }
    }

    // Manejar selección de proveedor desde autocomplete
    const handleSupplierSelect = (option: { id: string | number;[key: string]: unknown } | null) => {
        if (purchase.id) {
            onUpdate(purchase.id, 'person', option ? {
                id: option.id,
                name: option.label,
            } : null)
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
        <tr className='text-sm sm:text-base items-center odd:bg-white even:bg-gray-50' key={purchase.id}>
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
