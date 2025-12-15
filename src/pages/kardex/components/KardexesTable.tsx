import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Modal } from '../../components/modal/Modal'
import Kardex from '../../../types/Kardex'
import { kardexService } from '../../../services/KardexService'
import { useServerPagination } from '../../../hooks/useServerPagination'
import Pagination from '../../components/pagination/Pagination'

const headersTable = [
    'Fecha',
    'Producto',
    'Entrada',
    'Salida',
    'Saldo',
    'Ultimo Registro',
    'Operación',
    'Acciones',
]

export default function KardexesTable() {
    const [selectedKardex, setSelectedKardex] = useState<Kardex>({} as Kardex)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

    // Usar paginación del servidor
    const {
        data: kardexEntries,
        loading,
        error,
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage,
        goToPage,
        setItemsPerPage,
        refresh } = useServerPagination({
            fetchFunction: kardexService.getAllPaginated.bind(kardexService),
            initialPage: 1,
            initialLimit: 10,
        })

    const handleDelete = async (id: number) => {
        try {
            await kardexService.delete(id)
            console.log('Registro del kardex eliminado', id)
            refresh() // Refresca los datos de la página actual
            setIsDeleteConfirmOpen(false)
        } catch (error) {
            console.error('Error al eliminar el registro del kardex', error)
            alert('Error al eliminar el registro del kardex')
        }
    }

    const handleEdit = async (id: number) => {
        try {
            const { product, ...rest } = selectedKardex
            if (product?.id) {
                rest.productId = product?.id
            }
            await kardexService.update(id, rest)
            console.log('Registro del kardex actualizado', selectedKardex)
            refresh() // Refresca los datos de la página actual
            setIsEditModalOpen(false)
        } catch (error) {
            console.error('Error al actualizar el kardex', error)
            alert('Error al actualizar el kardex')
        }
    }

    // Loading state
    if (loading) {
        return <div className='p-4 text-center'>Cargando kardex...</div>
    }

    // Error state
    if (error) {
        return (
            <div className='p-4 bg-red-50 border border-red-200 rounded-md text-red-600'>
                <p className='font-medium'>Error al cargar kardex:</p>
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
        <section className='space-y-4 px-2 py-4 overflow-x-auto sm:overflow-visible '>

            <table className='w-full border border-gray-50 rounded-xl table-auto text-sm sm:text-base'>
                <thead>
                    <tr className='bg-gray-50'>
                        {headersTable.map((header) => (
                            <th
                                key={header}
                                className='p-2 text-left text-sm text-gray-600'>
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {kardexEntries.map((entry) => (
                        <tr
                            key={entry.id}
                            className={
                                'border-t border-gray-200' + entry.balance_record
                                    ? ' bg-green-50'
                                    : ''
                            }>
                            <td className='p-2'>
                                {new Date(entry.date).toLocaleDateString()}
                            </td>
                            <td className='p-2'>{entry.product?.name}</td>
                            <td className='p-2'>{entry.input}</td>
                            <td className='p-2'>{entry.output}</td>
                            <td className='p-2'>{entry.balance}</td>
                            <td className='p-2'>
                                {entry.balance_record ? 'Si' : 'No'}
                            </td>
                            <td className='p-2'>
                                {entry.operation === 1 ? 'Entrada' : ''}
                                {entry.operation === 2 ? 'Salida' : ''}
                                {entry.operation === 3 ? 'Kardex' : ''}
                            </td>
                            <td className='p-2'>

                                <button
                                    className='text-blue-600'
                                    onClick={() => {
                                        setSelectedKardex(entry)
                                        setIsEditModalOpen(true)
                                    }}>
                                    <Pencil className='mr-2 h-4 w-4' />
                                    Editar
                                </button>
                                <button
                                    className='text-red-600'
                                    onClick={() => {
                                        setSelectedKardex(entry)
                                        setIsDeleteConfirmOpen(true)
                                    }}>
                                    <Trash2 className='mr-2 h-4 w-4' />
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal de Edición */}
            <Modal
                open={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}>
                <h2 className='text-xl font-semibold mb-4'>
                    Editar Registro del Kardex
                </h2>
                <form>
                    <section className='mb-4'>
                        <label
                            htmlFor='date'
                            className='block text-sm font-medium text-gray-700'>
                            Fecha
                        </label>
                        <input
                            id='date'
                            name='date'
                            type='date'
                            value={
                                selectedKardex.date
                                    ? new Date(selectedKardex.date)
                                        .toISOString()
                                        .split('T')[0]
                                    : ''
                            }
                            onChange={(e) =>
                                setSelectedKardex({
                                    ...selectedKardex,
                                    date: new Date(e.target.value).toISOString(),
                                })
                            }
                            className='mt-1 p-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                        />
                    </section>
                    <section className='mb-4'>
                        <label
                            htmlFor='input'
                            className='block text-sm font-medium text-gray-700'>
                            Entrada
                        </label>
                        <input
                            id='input'
                            name='input'
                            type='number'
                            value={selectedKardex.input}
                            onChange={(e) =>
                                setSelectedKardex({
                                    ...selectedKardex,
                                    input: Number(e.target.value),
                                })
                            }
                            className='mt-1 p-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                        />
                    </section>
                    <section className='mb-4'>
                        <label
                            htmlFor='output'
                            className='block text-sm font-medium text-gray-700'>
                            Salida
                        </label>
                        <input
                            id='output'
                            name='output'
                            type='number'
                            value={selectedKardex.output}
                            onChange={(e) =>
                                setSelectedKardex({
                                    ...selectedKardex,
                                    output: Number(e.target.value),
                                })
                            }
                            className='mt-1 p-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                        />
                    </section>
                    {/* Aquí se podría recalcular el balance según se editen los valores */}
                    <section className='flex justify-end'>
                        <button
                            type='button'
                            onClick={() => setIsEditModalOpen(false)}
                            className='mr-2 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'>
                            Cancelar
                        </button>
                        <button
                            onClick={() =>
                                selectedKardex.id &&
                                handleEdit(selectedKardex.id)
                            }
                            type='button'
                            className='inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                            Guardar
                        </button>
                    </section>
                </form>
            </Modal>

            {/* Modal de Confirmación de Eliminación */}
            <Modal
                open={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}>
                <h2 className='text-xl font-semibold mb-4'>Confirmar Eliminación</h2>
                <p>¿Está seguro que desea eliminar este registro del kardex?</p>
                <section className='mt-4 flex justify-end space-x-2'>
                    <button
                        onClick={() => setIsDeleteConfirmOpen(false)}
                        className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200'>
                        Cancelar
                    </button>
                    <button
                        onClick={() =>
                            selectedKardex?.id && handleDelete(selectedKardex.id)
                        }
                        className='px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700'>
                        Eliminar                    </button>
                </section>
            </Modal>

            {/* Pagination Component */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={goToPage}
                onItemsPerPageChange={setItemsPerPage}
            />
        </section>
    )
}
