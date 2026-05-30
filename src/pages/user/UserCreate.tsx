import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

import { useApiRequest } from '../../hooks/useApiRequest'
import { userService } from '../../services/User'
import { Roles } from '../../enums/Roles'
import User from '../../types/User'
import { Button, FieldGroup, Input, Alert } from '../../components/ui'

interface UserCreateProps {
    onSuccess?: () => void
    onUserCreated?: (newUser: User) => void
}

const UserCreate = ({ onSuccess, onUserCreated }: UserCreateProps) => {
    const [user, setUser] = useState<User>({
        name: '',
        password: '',
        email: '',
        role: '',
    })

    const { loading, execute } = useApiRequest(
        (data: User) => userService.create(data),
        {
            successMessage: 'Usuario creado exitosamente',
            errorMessage: 'Error al crear el usuario',
            showSuccessToast: true,
            onSuccess: (newUser) => {
                if (onUserCreated) {
                    onUserCreated(newUser)
                }
                setUser({
                    name: '',
                    password: '',
                    email: '',
                    role: '',
                })
                setConfirmPassword('')
                setPasswordError('')

                if (onSuccess) {
                    onSuccess()
                }
            }
        }
    )

    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setUser({ ...user, [name]: value })

        if (name === 'password') {
            setPasswordError('')
        }
    }

    const validatePassword = () => {
        if (!user.password) {
            setPasswordError('Ingresa la contraseña.')
            return false
        }
        if (user.password.length < 6) {
            setPasswordError('La contraseña debe tener al menos 6 caracteres.')
            return false
        }
        if (user.password !== confirmPassword) {
            setPasswordError('Las contraseñas no coinciden.')
            return false
        }
        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validatePassword()) {
            return
        }
        // El hashing ocurre en el backend (security.service). Enviar en claro sobre HTTPS.
        await execute(user)
    }

    return (
        <form onSubmit={handleSubmit} className='space-y-4 px-2 overflow-auto' noValidate>
            <FieldGroup label="Nombre de usuario" required>
                <Input
                    type='text'
                    name='name'
                    autoComplete='username'
                    value={user.name}
                    onChange={handleChange}
                    placeholder="Ingresa el nombre del usuario"
                    required
                />
            </FieldGroup>

            <FieldGroup label="Correo electrónico" required>
                <Input
                    type='email'
                    name='email'
                    autoComplete='email'
                    value={user.email}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com"
                    required
                />
            </FieldGroup>

            <div className='flex flex-col'>
                <label
                    htmlFor='role'
                    className='block text-sm font-medium text-(--color-text-primary) mb-label'
                >
                    Rol
                    <span aria-hidden='true' className='ml-0.5 text-danger-500'>*</span>
                </label>
                <select
                    name='role'
                    id='role'
                    required
                    className='w-full h-input px-3 rounded-md border border-(--color-border) bg-(--color-bg-surface) text-(--color-text-primary) text-sm hover:border-(--color-border-strong) focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus-ring) transition-colors'
                    value={user.role}
                    onChange={(e) => setUser({ ...user, role: e.target.value })}
                >
                    <option value=''>Selecciona un rol</option>
                    <option value={Roles.ADMIN}>Administrador</option>
                    <option value={Roles.OFFICE}>Oficina</option>
                    <option value={Roles.OPERATOR}>Operador</option>
                </select>
            </div>

            <div>
                <label
                    htmlFor='password'
                    className='block text-sm font-medium text-(--color-text-primary) mb-label'
                >
                    Contraseña
                    <span aria-hidden='true' className='ml-0.5 text-danger-500'>*</span>
                </label>
                <div className='relative'>
                    <Input
                        type={showPassword ? 'text' : 'password'}
                        name='password'
                        id='password'
                        autoComplete='new-password'
                        value={user.password}
                        onChange={handleChange}
                        placeholder='Mínimo 6 caracteres'
                        hasError={Boolean(passwordError)}
                        className='pr-10'
                        required
                        minLength={6}
                    />
                    <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        className='absolute inset-y-0 right-0 pr-3 flex items-center text-(--color-text-muted) hover:text-(--color-text-secondary) transition-colors'
                    >
                        {showPassword ? <EyeOff className='h-4 w-4' aria-hidden='true' /> : <Eye className='h-4 w-4' aria-hidden='true' />}
                    </button>
                </div>
            </div>

            <div>
                <label
                    htmlFor='confirmPassword'
                    className='block text-sm font-medium text-(--color-text-primary) mb-label'
                >
                    Confirmar contraseña
                    <span aria-hidden='true' className='ml-0.5 text-danger-500'>*</span>
                </label>
                <div className='relative'>
                    <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name='confirmPassword'
                        id='confirmPassword'
                        autoComplete='new-password'
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder='Repite la contraseña'
                        hasError={Boolean(passwordError)}
                        className='pr-10'
                        required
                    />
                    <button
                        type='button'
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        className='absolute inset-y-0 right-0 pr-3 flex items-center text-(--color-text-muted) hover:text-(--color-text-secondary) transition-colors'
                    >
                        {showConfirmPassword ? <EyeOff className='h-4 w-4' aria-hidden='true' /> : <Eye className='h-4 w-4' aria-hidden='true' />}
                    </button>
                </div>
            </div>

            {passwordError && <Alert variant='danger'>{passwordError}</Alert>}

            <section className='flex w-full sm:justify-end'>
                <Button type='submit' loading={loading} variant='primary' className='w-full md:w-fit'>
                    Crear Usuario
                </Button>
            </section>
        </form>
    )
}

export default UserCreate
