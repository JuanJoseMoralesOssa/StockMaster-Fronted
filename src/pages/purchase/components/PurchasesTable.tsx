import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../../components/dropdown/DropdownMenu'
import { Fragment, useState } from 'react'
import { Modal } from '../../components/modal/Modal'
import Purchase from '../../../types/Purchase'
import { PurchaseService } from '../../../services/PurchaseService'
import Pagination from '../../components/pagination/Pagination'
import PurchasesDetailsTable from '../../purchase_details/PurchaseDetailsTable'
import PurchaseDetails from '../../../types/PurchaseDetails'
import { useAvailableProducts } from '../../../hooks/useAvailableProducts'
import { useAvailableSuppliers } from '../../../hooks/useAvailableSuppliers'
import { useToast } from '../../../hooks/useToast'

const purchaseService = new PurchaseService()

const headersTable = ['Ver', 'Fecha', 'Total kg', 'Productos', 'Proveedores', 'Detalles', 'Acciones']

interface PurchasesTableProps {
    purchases: Purchase[]
    loading: boolean
    error: string | null
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    goToPage: (page: number) => void
    setItemsPerPage: (limit: number) => void
    refresh: () => void
    updateItem: (updatedItem: Purchase, idField?: keyof Purchase) => void
    removeItem: (itemId: string | number, idField?: keyof Purchase) => void
}

export default function PurchasesTable({
    purchases,
    loading,
    error,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    goToPage,
    setItemsPerPage,
    refresh,
    updateItem,
    removeItem
}: Readonly<PurchasesTableProps>) {
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [selectedPurchase, setSelectedPurchase] = useState<Purchase>({} as Purchase)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [expandedPurchases, setExpandedPurchases] = useState<number[]>([])

    const { showSuccess, showError, confirmDelete } = useToast()

    const {
        products,
    } = useAvailableProducts()
    const {
        suppliers,
    } = useAvailableSuppliers()

    const togglePurchaseExpansion = (purchaseId: number | undefined) => {
        if (!purchaseId) return
        setExpandedPurchases(prev =>
            prev.includes(purchaseId)
                ? prev.filter(id => id !== purchaseId)
                : [...prev, purchaseId]
        )
    }

    const handleDelete = async (id: number) => {
        const confirmed = await confirmDelete(

            `¿Estás seguro de que deseas eliminar la compra del <span class="font-semibold text-red-600">${new Date(selectedPurchase.date ?? '').toLocaleDateString('es-ES')}</span>?`,
            'Eliminar Compra'
        )

        if (!confirmed) return

        try {
            await purchaseService.delete(id)
            await purchaseService.deleteWithDetails(id)
            removeItem(id)
            showSuccess('Compra eliminada exitosamente', 'Eliminación exitosa')
        } catch (error) {
            showError('Error al eliminar la compra', 'Error')
            console.error('Error deleting purchase:', error)
        }
    }

    const handleEdit = async () => {
        setIsLoading(true)
        if (!selectedPurchase.id) {
            showError('Error al editar la compra: ID no definido', 'Error')
            setIsLoading(false)
            return
        }
        if (!selectedPurchase.date) {
            showError('Error al editar la compra: Fecha no definida', 'Error')
            setIsLoading(false)
            return
        }
        let bad = false
        for (const detail of selectedPurchase.purchase_details ?? []) {
            if (detail.toDelete) continue
            if (!detail.productId || !detail.personId) {
                showError('Error al editar la compra: Producto o persona indefinida en detalle a crear', 'Error')
                setIsLoading(false)
                bad = true
                break
            }
        }
        if (bad) return

        try {
            const updatedPurchase = await purchaseService.updateWithDetails(selectedPurchase)
            if (updatedPurchase) {
                updateItem(updatedPurchase)
                showSuccess('Compra actualizada exitosamente', 'Actualización exitosa')
                setIsEditModalOpen(false)
            }
        } catch (error) {
            showError('Error al actualizar la compra', 'Error')
            console.error('Error updating purchase:', error)
        }
        setIsLoading(false)
    }

    // Loading state
    if (loading) {
        return <div className='p-4 text-center'>Cargando compras...</div>
    }

    // Error state
    if (error) {
        return (
            <div className='p-4 bg-red-50 border border-red-200 rounded-md text-red-600'>
                <p className='font-medium'>Error al cargar compras:</p>
                <p>{error}</p>
                <button
                    className='mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded-md text-sm'
                    onClick={() => refresh()}>
                    Reintentar
                </button>
            </div>
        )
    }

    return (
        <section className='px-2 py-4 overflow-x-auto sm:overflow-visible'>
            <table className='w-full border border-gray-50 rounded-xl table-auto text-sm sm:text-base'>
                <thead>
                    <tr className='bg-gray-50 text-left text-gray-600 uppercase text-xs sm:text-sm'>
                        {headersTable.map((header) => (
                            <th key={'PurchaseHeader' + header} className='p-2'>
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                    {purchases.map((purchase) => (
                        <Fragment key={purchase.id}>
                            {/* Fila principal de la compra */}
                            <tr className='text-sm sm:text-base hover:bg-gray-50'>
                                {/* Columna de expansión */}
                                <td className='p-2 whitespace-nowrap w-12'>
                                    <button
                                        onClick={() => togglePurchaseExpansion(purchase.id)}
                                        className="text-gray-400 hover:text-gray-600 transition-colors w-5 h-5 flex items-center justify-center"
                                        title="Ver detalles"
                                    >
                                        {purchase.id && expandedPurchases.includes(purchase.id) ? '▼' : '▶'}
                                    </button>
                                </td>

                                {/* Fecha */}
                                <td className='p-2 whitespace-nowrap'>
                                    {new Date(purchase.date).toLocaleString('es-ES', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                    })}
                                </td>

                                {/* Total KG */}
                                <td className='p-2 whitespace-nowrap'>
                                    {purchase.total_kg} kg
                                </td>

                                {/* Productos (resumen) */}
                                <td className='p-2 whitespace-nowrap'>
                                    {purchase.purchase_details && purchase.purchase_details.length > 0 ? (
                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                            {(() => {
                                                const uniqueProducts = purchase.purchase_details.reduce((acc: number[], detail) => {
                                                    const productId = detail.productId
                                                    if (productId && !acc.includes(productId)) {
                                                        acc.push(productId)
                                                    }
                                                    return acc
                                                }, [])
                                                const count = uniqueProducts.length
                                                return `${count} producto${count !== 1 ? 's' : ''}`
                                            })()}
                                        </span>
                                    ) : (
                                        <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs">
                                            Sin productos
                                        </span>
                                    )}
                                </td>

                                {/* Proveedores (resumen) */}
                                <td className='p-2 whitespace-nowrap'>
                                    {purchase.purchase_details && purchase.purchase_details.length > 0 ? (
                                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                                            {(() => {
                                                const uniqueSuppliers = purchase.purchase_details.reduce((acc: number[], detail) => {
                                                    const personId = detail.personId
                                                    if (personId && !acc.includes(personId)) {
                                                        acc.push(personId)
                                                    }
                                                    return acc
                                                }, [])
                                                const count = uniqueSuppliers.length
                                                return `${count} proveedor${count !== 1 ? 'es' : ''}`
                                            })()}
                                        </span>
                                    ) : (
                                        <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs">
                                            Sin proveedores
                                        </span>
                                    )}
                                </td>

                                {/* Detalles (resumen) */}
                                <td className='p-2 whitespace-nowrap'>
                                    {purchase.purchase_details && purchase.purchase_details.length > 0 ? (
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                            {purchase.purchase_details.length} detalle{purchase.purchase_details.length !== 1 ? 's' : ''}
                                        </span>
                                    ) : (
                                        <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs">
                                            Sin detalles
                                        </span>
                                    )}
                                </td>

                                {/* Acciones */}
                                <td className='p-2 cursor-pointer text-center'>
                                    <DropdownMenu>
                                        {isOpen &&
                                            selectedPurchase.id === purchase.id && (
                                                <button
                                                    className='fixed inset-0 z-0 w-full h-full bg-transparent cursor-default'
                                                    onClick={() => setIsOpen(false)}>
                                                    <span className='sr-only'>
                                                        Cerrar menú
                                                    </span>
                                                </button>
                                            )}
                                        <DropdownMenuTrigger
                                            onClick={() => {
                                                setIsOpen(!isOpen)
                                                setSelectedPurchase(purchase)
                                            }}
                                            className='focus:outline-none hover:bg-gray-100 rounded-2xl px-4 py-1 text-center'>
                                            <MoreHorizontal className='h-4 w-4' />
                                            <span className='sr-only'>Abrir menú</span>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            isOpen={
                                                isOpen &&
                                                selectedPurchase.id === purchase.id
                                            }>
                                            <DropdownMenuItem
                                                className='text-blue-600 hover:text-blue-800'
                                                onClick={() => {
                                                    setIsLoading(true)
                                                    setIsEditModalOpen(true)
                                                    setIsOpen(false)
                                                    setIsLoading(false)
                                                }}
                                                disabled={isLoading}
                                            >
                                                {!isLoading ? (
                                                    <>
                                                        <Pencil className='mr-2 h-4 w-4' />
                                                        <span>Editar</span>
                                                    </>
                                                ) : <span>Cargando...</span>}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className='text-red-600'
                                                onClick={() => {
                                                    setIsLoading(true)
                                                    handleDelete(purchase.id!)
                                                    setIsOpen(false)
                                                    setIsLoading(false)
                                                }}>
                                                {!isLoading ? (
                                                    <>
                                                        <Trash2 className='mr-2 h-4 w-4' />
                                                        <span>Eliminar</span>
                                                    </>
                                                ) : <span>Cargando...</span>}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>

                            {/* Fila expandible con detalles */}
                            {purchase.id && expandedPurchases.includes(purchase.id) && purchase.purchase_details && purchase.purchase_details.length > 0 && (
                                <tr>
                                    <td colSpan={headersTable.length} className="px-0 py-0">
                                        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
                                            <h4 className="text-sm font-medium text-gray-700 mb-3">
                                                Detalles de la Compra del {new Date(purchase.date).toLocaleDateString('es-ES')}
                                            </h4>
                                            <div className="bg-white rounded border border-gray-200 overflow-hidden">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-gray-100">
                                                        <tr>
                                                            <th className="px-4 py-2 text-left font-medium text-gray-700">Producto</th>
                                                            <th className="px-4 py-2 text-left font-medium text-gray-700">Proveedor</th>
                                                            <th className="px-4 py-2 text-left font-medium text-gray-700">Peso (KG)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {purchase.purchase_details.map((detail) => (
                                                            <tr key={detail.id} className="hover:bg-gray-50">
                                                                <td className="px-4 py-2 text-gray-900">
                                                                    {products.find(p => p.id === detail.productId)?.name || detail.productId}
                                                                </td>
                                                                <td className="px-4 py-2 text-gray-900">
                                                                    {suppliers.find(s => s.id === detail.personId)?.name || detail.personId}
                                                                </td>
                                                                <td className="px-4 py-2 text-gray-900">
                                                                    {detail.weight_kg} kg
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </Fragment>
                    ))}
                </tbody>
            </table>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}>
                <h2 className='text-xl font-semibold mb-4'>Editar Compra</h2>
                <form className='w-fit px-2 pr-5 '>
                    <section className='mb-4'>
                        <label
                            htmlFor='date'
                            className='block text-sm font-medium text-gray-700'>
                            Fecha
                        </label>
                        <input
                            name='date'
                            id='date'
                            type='date'
                            value={selectedPurchase.date?.split('T')[0]}
                            onChange={(e) => {
                                const dateObj = new Date(e.target.value)
                                // Ajustar para compensar el offset de la zona horaria
                                dateObj.setMinutes(
                                    dateObj.getMinutes() +
                                    dateObj.getTimezoneOffset()
                                )
                                setSelectedPurchase({
                                    ...selectedPurchase,
                                    date: dateObj.toISOString(),
                                })
                            }}
                            className='mt-1 min-w-fit w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                        />
                    </section>

                    <PurchasesDetailsTable
                        details={[
                            ...(selectedPurchase.purchase_details ?? []),
                        ]}
                        setDetails={(details: PurchaseDetails[]) => {
                            const total_kg = details.reduce(
                                (acc, detail) => {
                                    if (detail.toCreate && !detail.toDelete) {
                                        return acc + (detail.weight_kg ?? 0)
                                    }
                                    return acc
                                },
                                0
                            )
                            setSelectedPurchase({
                                ...selectedPurchase,
                                total_kg: total_kg,
                                purchase_details: details,
                            })
                        }}
                        mode='edit'
                    />

                    <section className='w-full flex flex-col sm:flex-row gap-2 sm:justify-end'>
                        <button
                            type='button'
                            onClick={() => setIsEditModalOpen(false)}
                            className='mr-2 inline-flex w-full sm:w-fit justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'>
                            Cancelar
                        </button>
                        <button
                            onClick={() => selectedPurchase.id && handleEdit()}
                            disabled={isLoading}
                            type='button'
                            className='inline-flex w-full sm:w-fit justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                            Guardar
                        </button>
                    </section>
                </form>
            </Modal>

            {/* Pagination */}
            <div className="mt-4">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={goToPage}
                    onItemsPerPageChange={setItemsPerPage}
                />
            </div>
        </section >
    )
}
