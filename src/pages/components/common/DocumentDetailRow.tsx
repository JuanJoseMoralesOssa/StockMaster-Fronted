import React from 'react'
import { Trash2 } from 'lucide-react'
import Product from '../../../types/Product'
import Person from '../../../types/Person'
import Autocomplete from './Autocomplete'

export type DocumentUpdateValue =
    | { id: string | number; name: unknown }
    | null
    | number
    | string

export interface BaseDocumentDetail {
    id?: number | string
    productId?: number | null
    product?: Partial<Product>
    personId?: number | null
    person?: Partial<Person>
    weight_kg?: number | null
    toCreate?: boolean
    toDelete?: boolean
}

interface DocumentDetailRowProps<T extends BaseDocumentDetail> {
    detail: T
    onUpdate: (id: number, field: string, value: DocumentUpdateValue) => void
    onDelete: (id: number) => void
    products: Partial<Product>[]
    suppliers: Person[]
    mode?: 'add' | 'edit'
}

const DocumentDetailRow = <T extends BaseDocumentDetail>({
    detail,
    onUpdate,
    onDelete,
    products,
    suppliers,
}: Readonly<DocumentDetailRowProps<T>>) => {
    const isNew = detail.id !== undefined && typeof detail.id === 'number' && detail.id < 0
    const canDelete = true
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
        option.id.toString() === ((detail.product?.id ?? detail.productId) as number | string)?.toString()
    )
    const selectedSupplier = supplierOptions.find(option =>
        option.id.toString() === ((detail.person?.id ?? detail.personId) as number | string)?.toString()
    )

    // Manejar selección de producto desde autocomplete
    const handleProductSelect = (option: { id: string | number;[key: string]: unknown } | null) => {
        if (typeof detail.id === 'number') {
            onUpdate(detail.id, 'product', option ? {
                id: option.id,
                name: option.label,
            } : null)
        }
    }

    // Manejar selección de proveedor desde autocomplete
    const handleSupplierSelect = (option: { id: string | number;[key: string]: unknown } | null) => {
        if (typeof detail.id === 'number') {
            onUpdate(detail.id, 'person', option ? {
                id: option.id,
                name: option.label,
            } : null)
        }
    }

    const handleNumberInputChange =
        (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
            if (typeof detail.id === 'number') {
                let value = parseFloat(e.target.value) || 0
                if (value < 0) {
                    value = 0
                }
                onUpdate(detail.id, field, (value == 0 ? '' : value))
            }
        }

    return (
        <tr className={`text-sm hover:bg-gray-50 transition-colors ${isNew ? 'bg-success-50' : 'bg-white'}`} key={detail.id}>
            <td className='px-4 py-3 whitespace-nowrap'>
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
            <td className='px-4 py-3 whitespace-nowrap'>
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
            <td className='px-4 py-3 whitespace-nowrap'>
                <input
                    type='number'
                    className='w-24 h-9 rounded-md border border-gray-200 bg-white px-2 text-sm text-center block transition-colors focus:border-gray-300 focus:ring-2 focus:ring-brand-500 focus:ring-offset-0 focus:outline-none'
                    name='weight_kg'
                    id={`weight_kg_${detail.id}`}
                    value={detail.weight_kg ?? ''}
                    min={0}
                    step='0.001'
                    required
                    onChange={handleNumberInputChange('weight_kg')}
                    aria-label="Peso en kilogramos"
                />
            </td>
            <td className='px-4 py-3 text-center'>
                <button
                    type='button'
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
                        canDelete
                            ? 'action-icon-delete'
                            : 'text-gray-300 cursor-not-allowed'
                    }`}
                    onClick={() => {
                        if (canDelete && detail.id !== undefined) {
                            onDelete(Number(detail.id))
                        }
                    }}
                    aria-label="Eliminar producto"
                    title="Eliminar producto"
                    disabled={!canDelete}>
                    <Trash2 className='w-4 h-4' />
                </button>
            </td>
        </tr>
    )
}

export default DocumentDetailRow
