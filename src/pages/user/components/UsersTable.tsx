import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../../components/dropdown/DropdownMenu'
import { useState } from 'react'
import { Modal } from '../../components/modal/Modal'
import User from '../../../types/User'
import { userService } from '../../../services/User'
import Pagination from '../../components/pagination/Pagination'
import bcrypt from 'bcryptjs'
import { Roles } from '../../../enums/Roles'
import { useToast } from '../../../hooks/useToast'

interface UsersTableProps {
    users: User[]
    loading: boolean
    error: string | null
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    goToPage: (page: number) => void
    setItemsPerPage: (limit: number) => void
    refresh: () => void
    updateItem: (updatedItem: User, idField?: keyof User) => void
    removeItem: (itemId: string | number, idField?: keyof User) => void
}

const headersTable = ['Usuario', 'Email', 'Rol', 'Acciones']

const getRoleDisplayName = (role: string): string => {
    if (role === Roles.ADMIN) return 'Admin'
    if (role === Roles.OFFICE) return 'Oficina'
    return 'Operador'
}

export default function UsersTable({
    users,
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
}: Readonly<UsersTableProps>) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User>({} as User)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const { showSuccess, showError, confirmDelete } = useToast()

    const validatePassword = () => {
        if (newPassword && newPassword.length < 6) {
            setPasswordError('La contraseña debe tener al menos 6 caracteres')
            return false
        }
        if (newPassword && newPassword !== confirmPassword) {
            setPasswordError('Las contraseñas no coinciden')
            return false
        }
        return true
    }

    const handleDelete = async (id: number) => {
        const confirmed = await confirmDelete(
            `¿Estás seguro de que deseas eliminar el usuario <span class="font-semibold text-red-600">${selectedUser.name}</span>?`,
            'Eliminar Usuario'
        )

        if (!confirmed) return

        try {
            await userService.delete(id)
            removeItem(id) // Update local state immediately
            showSuccess('Usuario eliminado exitosamente', 'Eliminación exitosa')
        } catch (error) {
            showError('Error al eliminar el usuario', 'Error')
            console.error('Error deleting user:', error)
        }
    }

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword && !validatePassword()) {
            return
        }
        console.log('Updating user:', selectedUser, 'with new password:', newPassword);

        try {
            const updatedUser = {
                ...selectedUser,
            }
            console.log('Selected user before update:', updatedUser);

            if (newPassword) {
                updatedUser.password = bcrypt.hashSync(newPassword, 12)
            } else {
                updatedUser.password = selectedUser.password
            }
            if (updatedUser.id !== undefined) {
                const result = await userService.updatePartial(Number(updatedUser.id), updatedUser)
                updateItem(result, 'id') // Update local state immediately
                showSuccess('Usuario actualizado exitosamente', 'Actualización exitosa')
                // Reset form state
                setIsEditModalOpen(false)
                setNewPassword('')
                setConfirmPassword('')
                setPasswordError('')
                setShowNewPassword(false)
                setShowConfirmPassword(false)
            } else {
                throw new Error('ID de usuario no definido')
            }
        } catch (error) {
            showError('Error al actualizar el usuario', 'Error')
            console.error('Error updating user:', error)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setSelectedUser({ ...selectedUser, [name]: value })
    }

    // Loading state
    if (loading) {
        return <div className='p-4 text-center'>Cargando usuarios...</div>
    }

    // Error state
    if (error) {
        return (
            <div className='p-4 bg-red-50 border border-red-200 rounded-md text-red-600'>
                <p className='font-medium'>Error al cargar usuarios:</p>
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
                            <th key={'UserHeader' + header} className='p-2'>
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                    {users.map((user) => (
                        <tr key={user.id} className='text-sm sm:text-base'>
                            <td className='p-2 whitespace-nowrap'>{user.name}</td>
                            <td className='p-2 whitespace-nowrap'>{user.email}</td>
                            <td className='p-2 whitespace-nowrap'>{getRoleDisplayName(user.role)}</td>
                            <td className='p-2 cursor-pointer text-center'>
                                <DropdownMenu>
                                    {isOpen && selectedUser.id === user.id && (
                                        <button
                                            className='fixed inset-0 z-0 w-full h-full bg-transparent cursor-default'
                                            onClick={() => setIsOpen(false)}>
                                            <span className='sr-only'>Cerrar menú</span>
                                        </button>
                                    )}
                                    <DropdownMenuTrigger
                                        onClick={() => {
                                            setIsOpen(!isOpen)
                                            setSelectedUser(user)
                                        }}
                                        className='focus:outline-none hover:bg-gray-100 rounded-2xl px-4 py-1 text-center'>
                                        <MoreHorizontal className='h-4 w-4' />
                                        <span className='sr-only'>Abrir menú</span>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        isOpen={isOpen && selectedUser.id === user.id}>
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
                                                handleDelete(Number(selectedUser.id!))
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
                onClose={() => {
                    setIsEditModalOpen(false)
                    setNewPassword('')
                    setConfirmPassword('')
                    setPasswordError('')
                    setShowNewPassword(false)
                    setShowConfirmPassword(false)
                }}>
                <h2 className='text-xl font-semibold mb-4'>Editar Usuario</h2>
                <form onSubmit={handleEdit} className='space-y-4'>
                    <div>
                        <label
                            htmlFor='userName'
                            className='block text-sm font-medium text-gray-700'>
                            Nombre de usuario
                        </label>
                        <input
                            id='userName'
                            type='text'
                            value={selectedUser.name || ''}
                            onChange={handleChange}
                            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                        />
                    </div>
                    <div>
                        <label
                            htmlFor='userEmail'
                            className='block text-sm font-medium text-gray-700'>
                            Email
                        </label>
                        <input
                            id='userEmail'
                            type='email'
                            value={selectedUser.email || ''}
                            onChange={handleChange}
                            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                        />
                    </div>
                    <div>
                        <label
                            htmlFor='userRole'
                            className='block text-sm font-medium text-gray-700'>
                            Rol
                        </label>
                        <select
                            id='userRole'
                            value={selectedUser.role || ''}
                            onChange={(e) =>
                                setSelectedUser({
                                    ...selectedUser,
                                    role: e.target.value,
                                })
                            }
                            className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'>
                            <option value={Roles.ADMIN}>Admin</option>
                            <option value={Roles.OFFICE}>Oficina</option>
                            <option value={Roles.OPERATOR}>Operador</option>
                        </select>
                    </div>
                    <div>
                        <label
                            htmlFor='newPassword'
                            className='block text-sm font-medium text-gray-700'>
                            Nueva contraseña (opcional)
                        </label>
                        <div className="relative">
                            <input
                                id='newPassword'
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => {
                                    setNewPassword(e.target.value)
                                    setPasswordError('')
                                }}
                                className='mt-1 block w-full pr-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                                {showNewPassword ? (
                                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 transition duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 transition duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label
                            htmlFor='confirmPassword'
                            className='block text-sm font-medium text-gray-700'>
                            Confirmar contraseña
                        </label>
                        <div className="relative">
                            <input
                                id='confirmPassword'
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value)
                                    setPasswordError('')
                                }}
                                className='mt-1 block w-full pr-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? (
                                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 transition duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 transition duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                    {passwordError && (
                        <p className='text-red-600 text-sm'>{passwordError}</p>
                    )}
                    <div className='flex justify-end space-x-2'>
                        <button
                            type='button'
                            onClick={() => {
                                setIsEditModalOpen(false)
                                setNewPassword('')
                                setConfirmPassword('')
                                setPasswordError('')
                                setShowNewPassword(false)
                                setShowConfirmPassword(false)
                            }}
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
