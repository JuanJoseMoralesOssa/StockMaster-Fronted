import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../../components/dropdown/DropdownMenu'
import { useEffect, useState } from 'react'
import { Modal } from '../../components/modal/Modal'
import Kardex from '../../../types/Kardex'
import { kardexService } from '../../../services/KardexService'

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

// const my_kardexes: Kardex[] = [
//     {
//         id: 1,
//         date: '2025-02-16T21:33:09.422Z',
//         input: 10,
//         output: 0,
//         balance: 10,
//         balance_record: true,
//         operation: 1,
//         productId: 1,
//         product: {
//             id: 1,
//             name: 'Producto A',
//         },
//     },
//     {
//         id: 2,
//         date: '2025-02-17T21:33:09.422Z',
//         input: 0,
//         output: 5,
//         balance: 5,
//         balance_record: true,
//         operation: 2,
//         productId: 2,
//         product: {
//             id: 2,
//             name: 'Producto B',
//         },
//     },
// ]

// const fetchKardexByProducts = async () => {
//     await new Promise((resolve) => setTimeout(resolve, 1000))
//     return my_kardexes
// }

export default function KardexesTable() {
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [selectedKardex, setSelectedKardex] = useState<Kardex>({} as Kardex)
    const [kardexEntries, setKardexEntries] = useState<Kardex[]>([])
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

    useEffect(() => {
        // Aquí se debería obtener el kardex real, por ejemplo:
        // fetchKardexByProducts().then(setKardexEntries)
        kardexService.getKardexByProducts().then((response) => {
            setKardexEntries(response)
        }).catch((error) => {
            console.error('Error al obtener el kardex', error)
        })
    }, [])

    const handleDelete = async (id: number) => {
        setLoading(true)
        await kardexService.delete(id).then(() => {
            console.log('Registro del kardex eliminado', id)
            alert('Registro del kardex eliminado con éxito')
        }).catch((error) => {
            console.error('Error al eliminar el registro del kardex', error)
            alert('Error al eliminar el registro del kardex')
        })
        setKardexEntries(kardexEntries.filter((entry) => entry.id !== id))
        setIsDeleteConfirmOpen(false)
        setLoading(false)
    }

    const handleEdit = async (id: number) => {
        setLoading(true)
        const { product, ...rest } = selectedKardex
        if (product?.id) {
            rest.productId = product?.id
        }
        await kardexService.update(id, rest).then(() => {
            console.log('Registro del kardex actualizado', selectedKardex)
            alert('Registro del kardex actualizado con éxito')
        })
        // Actualiza el registro del kardex en el estado local
        setKardexEntries(
            kardexEntries.map((entry) =>
                entry.id === selectedKardex.id ? selectedKardex : entry
            )
        )
        setIsEditModalOpen(false)
        setLoading(false)
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
                                <DropdownMenu>
                                    {isOpen && selectedKardex.id === entry.id && (
                                        <button
                                            className='fixed inset-0 z-0 w-full h-full bg-transparent cursor-default'
                                            onClick={() => {
                                                setIsOpen(false)
                                            }}>
                                            <span className='sr-only'>
                                                Cerrar menú
                                            </span>
                                        </button>
                                    )}
                                    <DropdownMenuTrigger
                                        className='focus:outline-none hover:bg-gray-100 rounded-2xl px-4 py-1 text-center'
                                        onClick={() => {
                                            setIsOpen(!isOpen)
                                            setSelectedKardex(entry)
                                        }}>
                                        <MoreHorizontal className='h-4 w-4' />
                                        <span className='sr-only'>Abrir menú</span>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        isOpen={
                                            isOpen && selectedKardex.id === entry.id
                                        }>
                                        <DropdownMenuItem
                                            className='text-blue-600'
                                            onClick={() => {
                                                setSelectedKardex(entry)
                                                setIsEditModalOpen(true)
                                                setIsOpen(false)
                                            }}>
                                            <Pencil className='mr-2 h-4 w-4' />
                                            Editar
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className='text-red-600'
                                            onClick={() => {
                                                setSelectedKardex(entry)
                                                setIsDeleteConfirmOpen(true)
                                                setIsOpen(false)
                                            }}>
                                            <Trash2 className='mr-2 h-4 w-4' />
                                            Eliminar
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal de Edición */}
            <Modal
                isOpen={isEditModalOpen}
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
                isOpen={isDeleteConfirmOpen}
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
                        Eliminar
                    </button>
                </section>
            </Modal>
        </section>
    )
}
