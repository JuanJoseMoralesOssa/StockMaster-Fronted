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
import { PersonService } from '../../../services/PersonService'
import Pagination from '../../components/pagination/Pagination'
import { useToast } from '../../../hooks/useToast'

const personService = new PersonService()

interface PersonsTableProps {
    people: Person[]
    loading: boolean
    error: string | null
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    goToPage: (page: number) => void
    setItemsPerPage: (limit: number) => void
    refresh: () => void
    updateItem: (updatedItem: Person, idField?: keyof Person) => void
    removeItem: (itemId: string | number, idField?: keyof Person) => void
}

const headersTable = ['Nombre', 'Acciones']

export default function PersonsTable({
    people,
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
}: Readonly<PersonsTableProps>) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedPerson, setSelectedPerson] = useState<Person>({} as Person)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)

    const { showSuccess, showError, confirmDelete } = useToast()

    const handleDelete = async (id: number) => {
        const confirmed = await confirmDelete(
            `¿Estás seguro de que deseas eliminar el proveedor <span class="font-semibold text-red-600">${selectedPerson.name}</span>?`,
            'Eliminar Proveedor'
        )

        if (!confirmed) return

        try {
            await personService.delete(id)
            removeItem(id) // Update local state immediately
            showSuccess('Proveedor eliminado exitosamente', 'Eliminación exitosa')
        } catch (error) {
            showError('Error al eliminar el proveedor', 'Error')
            console.error('Error deleting person:', error)
        }
    }

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (selectedPerson.id !== undefined) {
                const result = await personService.update(Number(selectedPerson.id), selectedPerson)
                updateItem(result) // Update local state immediately
                showSuccess('Proveedor actualizado exitosamente', 'Actualización exitosa')

                // Reset form state
                setIsEditModalOpen(false)
            } else {
                throw new Error('ID de proveedor no definido')
            }
        } catch (error) {
            showError('Error al actualizar el proveedor', 'Error')
            console.error('Error updating person:', error)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setSelectedPerson({ ...selectedPerson, [name]: value })
    }

    // Loading state
    if (loading) {
        return <div className='p-4 text-center'>Cargando proveedores...</div>
    }

    // Error state
    if (error) {
        return (
            <div className='p-4 bg-red-50 border border-red-200 rounded-md text-red-600'>
                <p className='font-medium'>Error al cargar proveedores:</p>
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
                                            <span className='sr-only'>Cerrar menú</span>
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
                                        isOpen={isOpen && selectedPerson.id === person.id}>
                                        <DropdownMenuItem
                                            className='text-blue-600 hover:text-blue-800'
                                            onClick={() => {
                                                setIsEditModalOpen(true)
                                                setIsOpen(false)
                                            }}>
                                            <Pencil className='mr-2 h-4 w-4' />
                                            <span>Editar</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className='text-red-600'
                                            onClick={() => {
                                                handleDelete(Number(selectedPerson.id!))
                                                setIsOpen(false)
                                            }}>
                                            <Trash2 className='mr-2 h-4 w-4' />
                                            <span>Eliminar</span>
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
                <form onSubmit={handleEdit} className='space-y-4'>
                    <div>
                        <label
                            htmlFor='personName'
                            className='block text-sm font-medium text-gray-700'>
                            Nombre del proveedor
                        </label>
                        <input
                            id='personName'
                            name='name'
                            type='text'
                            value={selectedPerson.name || ''}
                            onChange={handleChange}
                            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                        />
                    </div>
                    <div className='flex justify-end space-x-2'>
                        <button
                            type='button'
                            onClick={() => setIsEditModalOpen(false)}
                            className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                            Cancelar
                        </button>
                        <button
                            type='submit'
                            className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                            Guardar
                        </button>
                    </div>
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
        </section>
    )
}
