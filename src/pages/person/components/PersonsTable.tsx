import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../../components/dropdown/DropdownMenu'
import { useState } from 'react'
import { Modal } from '../../components/modal/Modal'
import Person from '../../../types/Person'
import { personService } from '../../../services/PersonService'
import { useServerPagination } from '../../../hooks/useServerPagination'
import Pagination from '../../components/pagination/Pagination'

const headersTable = ['Nombre', 'Acciones']

export default function PersonsTable() {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedPerson, setSelectedPerson] = useState<Person>({} as Person)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

    // Usar paginación del servidor
    const {
        data: people,
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
        fetchFunction: personService.getAllPaginated.bind(personService),
        initialPage: 1, initialLimit: 10,
    })

    const handleDelete = async (id: number) => {
        try {
            await personService.delete(id)
            refresh() // Refresca los datos de la página actual
            setIsDeleteConfirmOpen(false)
        } catch (error) {
            console.error('Error al eliminar la persona', error)
            alert('Error al eliminar la persona')
        }
    }

    const handleEdit = async (id: number) => {
        try {
            await personService.update(id, selectedPerson)
            refresh() // Refresca los datos de la página actual
            setIsEditModalOpen(false)
        } catch (error) {
            console.error('Error al actualizar la persona', error)
            alert('Error al actualizar la persona')
        }
    }

    // Loading state
    if (loading) {
        return <div className='p-4 text-center'>Cargando personas...</div>
    }

    // Error state
    if (error) {
        return (
            <div className='p-4 bg-red-50 border border-red-200 rounded-md text-red-600'>
                <p className='font-medium'>Error al cargar personas:</p>
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
                            <th key={'PersonHeader' + header} className='p-2'>
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                    {people.map((person) => (
                        <tr key={person.id} className='text-sm sm:text-base'>
                            <td className='p-2 whitespace-nowrap'>{person.name}</td>
                            <td className='p-2 cursor-pointer text-center'>
                                <DropdownMenu>
                                    {isOpen && selectedPerson.id === person.id && (
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
                                            setSelectedPerson(person)
                                        }}
                                        className='focus:outline-none hover:bg-gray-100 rounded-2xl px-4 py-1 text-center'>
                                        <MoreHorizontal className='h-4 w-4' />
                                        <span className='sr-only'>Abrir menú</span>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        isOpen={
                                            isOpen && selectedPerson.id === person.id
                                        }>
                                        <DropdownMenuItem
                                            className='text-blue-600 hover:text-blue-800'
                                            onClick={() => {
                                                setSelectedPerson(person)
                                                setIsEditModalOpen(true)
                                                setIsOpen(false)
                                            }}>
                                            <Pencil className='mr-2 h-4 w-4' />
                                            <p>Editar</p>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className='text-red-600'
                                            onClick={() => {
                                                setSelectedPerson(person)
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

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}>
                <h2 className='text-xl font-semibold mb-4'>Editar Proveedor</h2>
                <form>
                    <section className='mb-4'>
                        <label
                            htmlFor='name'
                            className='block text-sm font-medium text-gray-700'>
                            Nombre
                        </label>
                        <input
                            name='name'
                            id='name'
                            type='text'
                            value={selectedPerson.name}
                            onChange={(e) =>
                                setSelectedPerson({
                                    ...selectedPerson,
                                    name: e.target.value,
                                })
                            }
                            className='mt-1 p-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                        />
                    </section>
                    <section className='flex justify-end'>
                        <button
                            type='button'
                            onClick={() => setIsEditModalOpen(false)}
                            className='mr-2 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'>
                            Cancelar
                        </button>
                        <button
                            onClick={() => selectedPerson.id && handleEdit(selectedPerson.id)}
                            disabled={loading}
                            type='submit'
                            className='inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
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
                    Confirmar Eliminación de proveedor
                </h2>
                <article className='mb-4'>
                    ¿Estás seguro de que deseas eliminar al proveedor{' '}
                    <p className='font-semibold text-red-600 inline-block'>
                        {selectedPerson.name}
                    </p>{' '}
                    ?
                </article>
                <section className='flex justify-end'>
                    <button
                        type='button'
                        onClick={() => setIsDeleteConfirmOpen(false)}
                        className='mr-2 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'>
                        Cancelar
                    </button>
                    <button
                        type='button'
                        onClick={() =>
                            selectedPerson.id && handleDelete(selectedPerson.id)
                        }
                        className='inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'>
                        Eliminar
                    </button>
                </section>
            </Modal>

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
