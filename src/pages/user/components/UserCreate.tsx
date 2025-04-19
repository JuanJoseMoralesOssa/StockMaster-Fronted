import { useState } from 'react'
import User from '../../../types/User'
import { userService } from '../../../services/User'

// const createUser = async (user: User) => {
//     // Create user in the database
//     // const response = await fetch('https://api.example.com/users', {
//     //     method: 'POST',
//     //     headers: {
//     //         'Content-Type': 'application/json',
//     //     },
//     //     body: JSON.stringify(user),
//     // })
//     // const data = await response.json()
//     // return data
//     await new Promise((resolve) => setTimeout(resolve, 1000))
//     console.log('User created', user)
//     return user
// }

const UserCreate = () => {
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState<User>({
        name: '',
        password: '',
        role: '',
    })

    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordError, setPasswordError] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setUser({ ...user, [name]: value })

        // Clear password error when user starts typing again
        if (name === 'password') {
            setPasswordError('')
        }
    }

    const validatePassword = () => {
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
        setLoading(true)
        if (!validatePassword()) {
            return
        }
        await userService.create(user).then((response) => {
            console.log('User created', response)
            alert('Usuario creado')
            window.location.reload()
        }).catch((error) => {
            console.error('Error al crear Usuario creado', error)
            alert('Error al crear Usuario creado')
        })
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
                    <option value='admin'>Administrador</option>
                    <option value='oficina'>Oficina</option>
                    <option value='operador'>Operador</option>
                </select>
            </section>
            <section className='md:flex md:items-center md:justify-between md:space-x-4'>
                <label
                    htmlFor='password'
                    className='block text-sm font-medium text-gray-700 md:w-1/3'>
                    Contraseña
                </label>
                <input
                    type='password'
                    name='password'
                    id='password'
                    value={user.password}
                    required
                    minLength={6}
                    onChange={handleChange}
                    className='mt-1 p-1 block border w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:outline-none focus:ring-indigo-500 sm:text-sm md:w-full'
                />
            </section>
            <section className='md:flex md:items-center md:justify-between md:space-x-4'>
                <label
                    htmlFor='confirmPassword'
                    className='block text-sm font-medium text-gray-700 md:w-1/3'>
                    Confirmar Contraseña
                </label>
                <input
                    type='password'
                    name='confirmPassword'
                    id='confirmPassword'
                    value={confirmPassword}
                    required
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className='mt-1 p-1 block border w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:outline-none focus:ring-indigo-500 sm:text-sm md:w-full'
                />
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
