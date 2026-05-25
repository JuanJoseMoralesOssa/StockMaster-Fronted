import React, { useEffect } from 'react'
import { Plus, Package } from 'lucide-react'
import DocumentDetailRow, { DocumentUpdateValue } from './DocumentDetailRow'
import { useDetailsSummary } from '../../../hooks/useDetailsSummary'
import { useProductStore } from '../../../stores/useProductStore'
import { useSupplierStore } from '../../../stores/useSupplierStore'
import SummaryTable from './SummaryTable'
import { Alert, Button, TableSkeleton, EmptyState } from '../../../components/ui'

interface DocumentDetailsTableProps<T extends { id?: number | string }> {
    details: T[]
    setDetails: (details: T[]) => void
    title: string
    mode?: 'add' | 'edit'
}

export default function DocumentDetailsTable<T extends { id?: number | string; productId?: number | null; weight_kg?: number | null; toDelete?: boolean }>({
    details,
    setDetails,
    title,
    mode,
}: Readonly<DocumentDetailsTableProps<T>>) {
    const detailsLength = details.length
    const {
        products,
        isLoading: productsLoading,
        error: productsError,
        fetchProducts,
        refreshProducts,
    } = useProductStore()
    const {
        suppliers,
        isLoading: suppliersLoading,
        error: suppliersError,
        fetchSuppliers,
        refreshSuppliers,
    } = useSupplierStore()

    useEffect(() => {
        fetchProducts()
        fetchSuppliers()
    }, [fetchProducts, fetchSuppliers])

    // useDetailsSummary expects objects with weight_kg, product, etc.
    const { productSummary } = useDetailsSummary(details)

    const addDetail = (e: React.FormEvent) => {
        e.preventDefault()
        const newDetails = [
            ...details,
            {
                id: -Date.now(),
                productId: 0,
                product: { id: 0, name: '' },
                personId: 0,
                person: { id: 0, name: '' },
            } as unknown as T,
        ]
        setDetails(newDetails)
    }

    const deleteDetail = (id: number) => {
        const detail = details.find(d => d.id === id)
        if (!detail) return

        const isNew = typeof detail.id === 'number' && detail.id < 0

        if (isNew) {
            setDetails(details.filter(val => val.id !== id))
        } else {
            setDetails(details.map(d =>
                d.id === id ? { ...d, toDelete: true } : d
            ))
        }
    }

    const updateDetail = (id: number, field: string, value: DocumentUpdateValue) => {
        const newDetails = details.map((row) => {
            if (row.id === id) {
                const baseUpdated = { ...row, [field]: value } as unknown
                if (field === 'product' && value && typeof value === 'object' && 'id' in value) {
                    const idVal = (value as { id?: number }).id
                    const updatedRow = { ...(baseUpdated as object), productId: idVal } as unknown as T
                    return updatedRow
                } else if (field === 'person' && value && typeof value === 'object' && 'id' in value) {
                    const idVal = (value as { id?: number }).id
                    const updatedRow = { ...(baseUpdated as object), personId: idVal } as unknown as T
                    return updatedRow
                }
                return baseUpdated as T
            }
            return row
        })
        setDetails(newDetails)
    }

    if (productsLoading || suppliersLoading) {
        return <TableSkeleton rows={3} cols={4} />
    }

    if (productsError || suppliersError) {
        return (
            <Alert
                variant="danger"
                title="No se pudieron cargar los datos"
                action={
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                            if (productsError) refreshProducts()
                            if (suppliersError) refreshSuppliers()
                        }}
                    >
                        Reintentar
                    </Button>
                }
            >
                {productsError?.message ?? suppliersError?.message}
            </Alert>
        )
    }

    const showEmptyState = detailsLength === 0 && mode === 'add'
    const hasVisibleDetails = details.filter(d => !d.toDelete).length > 0

    return (
        <div className='w-full flex flex-col gap-8'>
            {showEmptyState ? (
                <EmptyState
                    icon={<Package className="w-8 h-8" aria-hidden="true" />}
                    title="Sin productos"
                    description="Agrega tu primer producto al documento para comenzar."
                    action={
                        <Button
                            variant="primary"
                            size="sm"
                            leftIcon={<Plus className="w-4 h-4" aria-hidden="true" />}
                            onClick={addDetail}
                        >
                            Agregar Producto
                        </Button>
                    }
                />
            ) : (
                <>
                    <section className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
                        <h2 className='text-lg font-medium tracking-tight text-(--color-text-primary)'>
                            {title}
                        </h2>
                        <Button
                            variant="primary"
                            size="md"
                            leftIcon={<Plus className="w-4 h-4" aria-hidden="true" />}
                            onClick={addDetail}
                            className="w-full sm:w-auto"
                        >
                            Agregar Producto
                        </Button>
                    </section>

                    {hasVisibleDetails ? (
                        <>
                            <div className='overflow-x-auto rounded-lg border border-(--color-border) bg-(--color-bg-surface) shadow-xs'>
                                <table className='w-full table-auto text-sm'>
                                    <thead>
                                        <tr className='border-b border-(--color-border) bg-(--view-accent-soft,var(--color-bg-subtle))'>
                                            <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-(--color-text-secondary)'>Producto</th>
                                            <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-(--color-text-secondary)'>Proveedor</th>
                                            <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-(--color-text-secondary)'>kg</th>
                                            <th className='px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-(--color-text-secondary)'>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className='divide-y divide-(--color-border)'>
                                        {details.filter(d => !d.toDelete).map((detail, index) => (
                                            <DocumentDetailRow<typeof detail>
                                                key={detail.id ?? `temp-${index}`}
                                                detail={detail}
                                                onUpdate={updateDetail}
                                                onDelete={deleteDetail}
                                                products={products}
                                                suppliers={suppliers}
                                                mode={mode}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {productSummary.length > 0 && (
                                <SummaryTable
                                    data={productSummary}
                                    title='Total por producto (kg)'
                                    valueLabel='Total (kg)'
                                    valueField='total_weight'
                                />
                            )}
                        </>
                    ) : (
                        <div className='rounded-lg border border-(--color-border) bg-(--color-bg-subtle) px-6 py-8 text-center'>
                            <p className='text-sm text-(--color-text-muted)'>No hay productos agregados</p>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
