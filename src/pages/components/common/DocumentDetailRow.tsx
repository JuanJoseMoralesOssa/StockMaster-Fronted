import React from 'react'
import { Trash2 } from 'lucide-react'
import Product from '../../../types/Product'
import Person from '../../../types/Person'
import Autocomplete from './Autocomplete'
import { Button } from '../../../components/ui'

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
    /** `row` = table row (md+); `card` = stacked card (mobile). */
    variant?: 'row' | 'card'
}

const DocumentDetailRow = <T extends BaseDocumentDetail>({
    detail,
    onUpdate,
    onDelete,
    products,
    suppliers,
    variant = 'row',
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
                // Guardamos como máximo 3 decimales (precisión de kg)
                value = Math.round(value * 1000) / 1000
                onUpdate(detail.id, field, (value == 0 ? '' : value))
            }
        }

    // Shared field controls — rendered inside a <tr> on md+ and a stacked card on mobile.
    const productAutocomplete = (label: string) => (
        <Autocomplete
            options={productOptions}
            label={label}
            placeholder="Buscar producto..."
            displayKey="label"
            initialValue={selectedProduct?.label || ''}
            onSelect={handleProductSelect}
            clearable={true}
            noOptionsText="No se encontraron productos"
            className="text-sm"
        />
    )

    const supplierAutocomplete = (label: string) => (
        <Autocomplete
            options={supplierOptions}
            label={label}
            placeholder="Buscar proveedor..."
            displayKey="label"
            initialValue={selectedSupplier?.label || ''}
            onSelect={handleSupplierSelect}
            clearable={true}
            noOptionsText="No se encontraron proveedores"
            className="text-sm"
        />
    )

    const weightInput = (className: string) => (
        <input
            type='number'
            inputMode='decimal'
            className={className}
            name='weight_kg'
            id={`weight_kg_${detail.id}`}
            value={detail.weight_kg ?? ''}
            min={0}
            step='0.001'
            required
            onChange={handleNumberInputChange('weight_kg')}
            aria-label="Peso en kilogramos"
        />
    )

    const handleDelete = () => {
        if (canDelete && detail.id !== undefined) {
            onDelete(Number(detail.id))
        }
    }

    const numberInputBase =
        'block h-input rounded-md border border-(--color-border) bg-(--color-bg-surface) px-2 text-sm pointer-coarse:text-[1rem] text-(--color-text-primary) transition-colors hover:border-(--color-border-strong) focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus-ring)'

    if (variant === 'card') {
        return (
            <li className={`rounded-lg border border-(--color-border) p-4 shadow-xs ${isNew ? 'bg-success-50' : 'bg-(--color-bg-surface)'}`}>
                <div className='flex flex-col gap-3'>
                    {productAutocomplete('Producto')}
                    {supplierAutocomplete('Proveedor')}
                    <div className='flex items-end gap-3'>
                        <div className='flex-1'>
                            <label
                                htmlFor={`weight_kg_${detail.id}`}
                                className='mb-1 block text-sm font-medium text-(--color-text-secondary)'
                            >
                                Peso (kg)
                            </label>
                            {weightInput(`${numberInputBase} w-full text-left`)}
                        </div>
                        <Button
                            type='button'
                            variant='ghost'
                            size='icon-md'
                            onClick={handleDelete}
                            aria-label='Eliminar producto'
                            title='Eliminar producto'
                            className='action-icon-delete shrink-0 [@media(pointer:coarse)]:h-11 [@media(pointer:coarse)]:w-11'
                        >
                            <Trash2 className='h-4 w-4' aria-hidden='true' />
                        </Button>
                    </div>
                </div>
            </li>
        )
    }

    return (
        <tr className={`text-sm transition-colors hover:bg-(--color-bg-subtle) ${isNew ? 'bg-success-50' : 'bg-(--color-bg-surface)'}`} key={detail.id}>
            <td className='px-4 py-3 whitespace-nowrap'>
                <div className="w-48">
                    {productAutocomplete('')}
                </div>
            </td>
            <td className='px-4 py-3 whitespace-nowrap'>
                <div className="w-48">
                    {supplierAutocomplete('')}
                </div>
            </td>
            <td className='px-4 py-3 whitespace-nowrap'>
                {weightInput(`${numberInputBase} w-24 text-center`)}
            </td>
            <td className='px-4 py-3 text-center'>
                <button
                    type='button'
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
                        canDelete
                            ? 'action-icon-delete'
                            : 'text-(--color-text-muted) cursor-not-allowed'
                    }`}
                    onClick={handleDelete}
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
