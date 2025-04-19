import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../../components/dropdown/DropdownMenu'
import { useEffect, useState } from 'react'
import { Modal } from '../../components/modal/Modal'
import User from '../../../types/User'
import { userService } from '../../../services/User'

// const sample_users: User[] = [
//     {
//         id: 1,
//         name: 'admin',
//         role: 'admin',
//         password: '********',
//     },
//     {
//         id: 2,
//         name: 'user1',
//         role: 'oficina',
//         password: '********',
//     },
// ]

const headersTable = ['Usuario', 'Rol', 'Acciones']

const fetchUsers = async (): Promise<User[]> => {
    return await userService.getAll();
}

export default function UsersTable() {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User>({} as User)
    const [users, setUsers] = useState<User[]>([])
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchUsers().then((res) => {
            setUsers(res)
        })
            .catch((error) => {
                console.error('Error al cargar los usuarios', error)
                setUsers([])
                alert('Error al cargar los usuarios')
            })
    }, [])

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
        setIsLoading(true)
        await userService.delete(id).catch((error) => {
            console.error('Error al eliminar el usuario', error)
            alert('Error al eliminar el usuario')
        })
        setUsers(users.filter((user) => user.id !== id))
        setIsDeleteConfirmOpen(false)
        setIsLoading(false)
    }

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        if (newPassword && !validatePassword()) {
            return
        }

        const updatedUser = {
            ...selectedUser,
            password: newPassword || selectedUser.password,
        }
        if (updatedUser.id !== undefined) {
            await userService.update(updatedUser.id, updatedUser)
            setUsers(
                users.map((user) => (user.id === selectedUser.id ? updatedUser : user))
            )
        } else {
            console.error('User ID is undefined. Cannot update user.')
            alert('Error al actualizar el usuario')
        }
        setIsLoading(false)
        setIsEditModalOpen(false)
        setNewPassword('')
        setConfirmPassword('')
        setPasswordError('')
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
                            <td className='p-2 whitespace-nowrap'>{user.role}</td>
                            <td className='p-2 cursor-pointer text-center'>
                                <DropdownMenu>
                                    {isOpen && selectedUser.id === user.id && (
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
                                            setSelectedUser(user)
                                        }}
                                        className='focus:outline-none hover:bg-gray-100 rounded-2xl px-4 py-1 text-center'>
                                        <MoreHorizontal className='h-4 w-4' />
                                        <span className='sr-only'>Abrir menú</span>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        isOpen={
                                            isOpen && selectedUser.id === user.id
                                        }>
                                        <DropdownMenuItem
                                            className='text-blue-600 hover:text-blue-800'
                                            onClick={() => {
                                                setSelectedUser(user)
                                                setIsEditModalOpen(true)
                                                setIsOpen(false)
                                            }}>
                                            <Pencil className='mr-2 h-4 w-4' />
                                            <p>Editar</p>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className='text-red-600'
                                            onClick={() => {
                                                setSelectedUser(user)
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
                onClose={() => {
                    setIsEditModalOpen(false)
                    setNewPassword('')
                    setConfirmPassword('')
                    setPasswordError('')
                }}>
                <h2 className='text-xl font-semibold mb-4'>Editar Usuario</h2>
                <form onSubmit={handleEdit}>
                    <section className='mb-4'>
                        <label
                            htmlFor='name'
                            className='block text-sm font-medium text-gray-700'>
                            Nombre de Usuario
                        </label>
                        <input
                            name='name'
                            id='name'
                            type='text'
                            value={selectedUser.name}
                            onChange={(e) =>
                                setSelectedUser({
                                    ...selectedUser,
                                    name: e.target.value,
                                })
                            }
                            className='mt-1 p-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                        />
                    </section>
                    <section className='mb-4'>
                        <label
                            htmlFor='role'
                            className='block text-sm font-medium text-gray-700'>
                            Rol
                        </label>
                        <select
                            name='role'
                            id='role'
                            required
                            className='mt-1 p-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                            value={selectedUser.role}
                            onChange={(e) =>
                                setSelectedUser({
                                    ...selectedUser,
                                    role: e.target.value,
                                })
                            }>
                            <option value=''>Selecciona un rol</option>
                            <option value='admin'>Administrador</option>
                            <option value='oficina'>Oficina</option>
                            <option value='operador'>Operador</option>
                        </select>
                    </section>
                    <section className='mb-4'>
                        <label
                            htmlFor='newPassword'
                            className='block text-sm font-medium text-gray-700'>
                            Nueva Contraseña (opcional)
                        </label>
                        <input
                            name='newPassword'
                            id='newPassword'
                            type='password'
                            value={newPassword}
                            onChange={(e) => {
                                setNewPassword(e.target.value)
                                setPasswordError('')
                            }}
                            className='mt-1 p-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                        />
                    </section>
                    {newPassword && (
                        <section className='mb-4'>
                            <label
                                htmlFor='confirmPassword'
                                className='block text-sm font-medium text-gray-700'>
                                Confirmar Nueva Contraseña
                            </label>
                            <input
                                name='confirmPassword'
                                id='confirmPassword'
                                type='password'
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value)
                                    setPasswordError('')
                                }}
                                className='mt-1 p-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                            />
                        </section>
                    )}
                    {passwordError && (
                        <p className='text-red-500 text-sm mb-4'>{passwordError}</p>
                    )}
                    <section className='flex justify-end'>
                        <button
                            type='button'
                            onClick={() => {
                                setIsEditModalOpen(false)
                                setNewPassword('')
                                setConfirmPassword('')
                                setPasswordError('')
                            }}
                            className='mr-2 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'>
                            Cancelar
                        </button>
                        <button
                            disabled={!isLoading}
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
                    Confirmar Eliminación de Usuario
                </h2>
                <p className='mb-4'>
                    ¿Estás seguro de que deseas eliminar al usuario{' '}
                    <p className='font-semibold text-red-600 inline-block'>
                        {selectedUser.name}
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
                        disabled={!isLoading}
                        type='button'
                        onClick={() =>
                            selectedUser.id && handleDelete(selectedUser.id)
                        }
                        className='inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'>
                        Eliminar
                    </button>
                </section>
            </Modal>
        </section>
    )
}
