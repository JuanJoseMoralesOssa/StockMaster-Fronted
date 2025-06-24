import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../../components/dropdown/DropdownMenu'
import { useState } from 'react'
import { Modal } from '../../components/modal/Modal'
import Purchase from '../../../types/Purchase'
import { purchaseService } from '../../../services/PurchaseService'
import { useServerPagination } from '../../../hooks/useServerPagination'
import Pagination from '../../components/pagination/Pagination'
import PurchasesDetailsTable from '../../purchase_details/PurchaseDetailsTable'
import PurchaseDetails from '../../../types/PurchaseDetails'

const headersTable = ['Fecha', 'Total kg', 'Acciones']

export default function PurchasesTable() {
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [selectedPurchase, setSelectedPurchase] = useState<Purchase>({} as Purchase)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

    // Server-side pagination
    const {
        data: purchases,
        loading,
        error,
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage,
        goToPage,
        setItemsPerPage,
        refresh
    } = useServerPagination({
        fetchFunction: purchaseService.getAllPaginatedWithDetails.bind(purchaseService),
        initialPage: 1,
        initialLimit: 10,
    })
    const handleDelete = async (id: number) => {
        try {
            await purchaseService.delete(id)
            await purchaseService.deleteWithDetails(id)
            refresh() // Refresh data after delete
            setIsDeleteConfirmOpen(false)
        } catch (error) {
            console.error('Error al eliminar la compra', error)
            alert('Error al eliminar la compra')
        }
    }

    const handleEdit = async () => {
        setIsLoading(true)
        if (!selectedPurchase.id) {
            alert('Error al editar la compra: ID no definido')
            setIsLoading(false)
            return
        }
        if (!selectedPurchase.date) {
            alert('Error al editar la compra: Fecha no definida')
            setIsLoading(false)
            return
        }
        let bad = false
        for (const detail of selectedPurchase.purchase_details ?? []) {
            if (detail.toDelete) continue
            if (!detail.productId || !detail.personId) {
                alert(':( Error al editar la compra: Producto o persona indefinida en detalle a crear')
                setIsLoading(false)
                bad = true
                break
            }
        }
        if (bad) return

        const updatedPurchase = await purchaseService.updateWithDetails(selectedPurchase)
            .catch((error: unknown) => {
                console.error('Error al editar la compra', error)
                if (error instanceof Error) {
                    alert(`Error al editar la compra: ${error.message}`);
                } else {
                    alert('Error al editar la compra');
                }
                return null
            })
        if (updatedPurchase?.total_kg) {
            selectedPurchase.total_kg = updatedPurchase.total_kg ?? 0;
        }

        refresh() // Refresh data after edit
        setIsEditModalOpen(false)
        setIsLoading(false)
    }    // Loading state
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
                        <tr key={purchase.id} className='text-sm sm:text-base'>
                            <td className='p-2 whitespace-nowrap'>
                                {new Date(purchase.date).toLocaleString('es-ES', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                })}
                            </td>
                            <td className='p-2 whitespace-nowrap'>
                                {purchase.total_kg}
                            </td>
                            {/* <td className='p-2 whitespace-nowrap'>
                                {getPersonName(purchase.personId)}
                            </td> */}
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
                                                setIsDeleteConfirmOpen(true)
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

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}>
                <h2 className='text-xl font-semibold mb-4'>
                    Confirmar Eliminación de Compra
                </h2>
                <p className='mb-4'>
                    ¿Estás seguro de que deseas eliminar la compra{' '}
                    {selectedPurchase.date ? 'del ' : ''}
                    <p className='font-semibold text-red-600 inline-block'>
                        <strong>
                            {selectedPurchase.date
                                ?.split('T')[0]
                                .split('-')
                                .reverse()
                                .join('/')}{' '}
                        </strong>
                        {selectedPurchase.total_kg
                            ? ' de ' + selectedPurchase.total_kg + ' kg'
                            : ''}
                    </p>
                    ?
                </p>
                <section className='flex justify-end'>
                    <button
                        type='button'
                        onClick={() => setIsDeleteConfirmOpen(false)}
                        className='mr-2 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'>
                        Cancelar
                    </button>
                    <button
                        type='button'
                        disabled={isLoading}
                        onClick={() =>
                            selectedPurchase.id && handleDelete(selectedPurchase.id)
                        }
                        className='inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'>
                        Eliminar
                    </button>                </section>
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
