import { useState } from 'react'
import User from '../../../types/User'
import { userService } from '../../../services/User'
import bcrypt from 'bcryptjs'
import { Roles } from '../../../enums/Roles'
import { useCrudToast } from '../../../hooks/useToast'

interface UserCreateProps {
    onSuccess?: () => void
}

const UserCreate = ({ onSuccess }: UserCreateProps) => {
    const [loading, setLoading] = useState(false)
    const { handleCreate } = useCrudToast()
    const [user, setUser] = useState<User>({
        name: '',
        password: '',
        email: '',
        role: '',
    })

    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setUser({ ...user, [name]: value })

        // Clear password error when user starts typing again
        if (name === 'password') {
            setPasswordError('')

        }
    }

    const validatePassword = () => {
        if (!user.password) {
            setPasswordError('La contraseña es obligatoria')
            return false
        }

        if (user.password.length < 6) {
            setPasswordError('La contraseña debe tener al menos 6 caracteres')
            return false
        }
        if (user.password !== confirmPassword) {
            setPasswordError('Las contraseñas no coinciden')
            return false
        }
        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validatePassword()) {
            setLoading(false)
            return
        }

        setLoading(true)

        const result = await handleCreate(async () => {
            const hashedUser = { ...user, password: bcrypt.hashSync(user.password!, 12) }
            return await userService.create(hashedUser)
        }, 'Usuario')

        if (result) {
            // Limpiar formulario después de creación exitosa
            setUser({
                name: '',
                password: '',
                email: '',
                role: '',
            })
            setConfirmPassword('')
            setPasswordError('')

            // Llamar callback si existe (para cerrar modal)
            if (onSuccess) {
                onSuccess()
            }
        }

        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className='space-y-4 px-2 overflow-auto'>
            <section className='md:flex md:items-center md:justify-between md:space-x-4'>
                <label
                    htmlFor='name'
                    className='block text-sm font-medium text-gray-700 md:w-1/3'>
                    Nombre de Usuario
                </label>
                <input
                    type='text'
                    name='name'
                    id='name'
                    value={user.name}
                    required
                    onChange={handleChange}
                    className='mt-1 p-1 block border w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:outline-none focus:ring-indigo-500 sm:text-sm md:w-full'
                />
            </section>
            <section className='md:flex md:items-center md:justify-between md:space-x-4'>
                <label
                    htmlFor='email'
                    className='block text-sm font-medium text-gray-700 md:w-1/3'>
                    Correo Electrónico
                </label>
                <input
                    type='email'
                    name='email'
                    id='email'
                    value={user.email}
                    required
                    onChange={handleChange}
                    className='mt-1 p-1 block border w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:outline-none focus:ring-indigo-500 sm:text-sm md:w-full'
                />
            </section>
            <section className='md:flex md:items-center md:justify-between md:space-x-4'>
                <label
                    htmlFor='role'
                    className='block text-sm font-medium text-gray-700 md:w-1/3'>
                    Rol
                </label>
                <select
                    name='role'
                    id='role'
                    required
                    className='mt-1 p-1 block border w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:outline-none focus:ring-indigo-500 sm:text-sm md:w-full'
                    value={user.role}
                    onChange={(e) =>
                        setUser({
                            ...user,
                            role: e.target.value,
                        })
                    }>
                    <option value=''>Selecciona un rol</option>
                    <option value={Roles.ADMIN}>Administrador</option>
                    <option value={Roles.OFFICE}>Oficina</option>
                    <option value={Roles.OPERATOR}>Operador</option>
                </select>
            </section>
            <section className='md:flex md:items-center md:justify-between md:space-x-4'>
                <label
                    htmlFor='password'
                    className='block text-sm font-medium text-gray-700 md:w-1/3'>
                    Contraseña
                </label>
                <div className="relative md:w-full">
                    <input
                        type={showPassword ? "text" : "password"}
                        name='password'
                        id='password'
                        value={user.password}
                        required
                        minLength={6}
                        onChange={handleChange}
                        className='mt-1 p-1 pr-10 block border w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:outline-none focus:ring-indigo-500 sm:text-sm'
                    />
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? (
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
            </section>
            <section className='md:flex md:items-center md:justify-between md:space-x-4'>
                <label
                    htmlFor='confirmPassword'
                    className='block text-sm font-medium text-gray-700 md:w-1/3'>
                    Confirmar Contraseña
                </label>
                <div className="relative md:w-full">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        name='confirmPassword'
                        id='confirmPassword'
                        value={confirmPassword}
                        required
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className='mt-1 p-1 pr-10 block border w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:outline-none focus:ring-indigo-500 sm:text-sm'
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
            </section>
            {passwordError && (
                <p className='text-red-500 text-sm'>{passwordError}</p>
            )}
            <section className='flex w-full sm:justify-end'>
                <button
                    disabled={loading}
                    type='submit'
                    className='inline-flex w-full md:w-fit justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                    Crear Usuario
                </button>
            </section>
        </form>
    )
}

export default UserCreate
