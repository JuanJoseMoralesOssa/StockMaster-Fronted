import { Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { LogIn } from 'lucide-react'
import useAuthStore from '../../../stores/useAuthStore'
import { useToast } from '../../../hooks/useToast'
import { Button, FieldGroup, Input, PasswordInput, Alert } from '../../../components/ui'

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Ingresa tu correo electrónico.')
    .email('El correo electrónico no es válido.'),
  password: z.string().min(1, 'Ingresa tu contraseña.'),
})

type LoginFormValues = z.infer<typeof loginSchema>

function Login() {
  const { login, isAuthenticated } = useAuthStore()

  const { showSuccess, showError } = useToast()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  })

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values)
      showSuccess('¡Bienvenido! Has iniciado sesión correctamente.', 'Inicio de sesión exitoso')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión'
      showError(errorMessage, 'Error de autenticación')
    }
  }

  return (
    <div className="min-h-dvh w-full flex items-center justify-center bg-linear-to-br from-(--color-bg-page) via-(--color-bg-surface) to-(--color-bg-subtle) py-12 md:py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-4">
          <div className='w-full flex flex-wrap items-center justify-center gap-2 mb-1'>
            <div className="h-12 w-12 sm:h-16 sm:w-16 bg-linear-to-br from-logo-from to-logo-to rounded-2xl flex items-center justify-center shadow-lg shrink-0">
              <svg className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-(--color-text-primary)">
              Inicia Sesión
            </h2>
          </div>
          <p className="text-(--color-text-secondary)">
            Bienvenido al Sistema de Inventario
          </p>
        </div>

        <div className="bg-(--color-bg-surface) rounded-2xl shadow-xl border border-(--color-border) p-6">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-4">
              <FieldGroup
                label="Correo electrónico"
                error={errors.email?.message}
                required
              >
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="correo@ejemplo.com"
                  {...register('email')}
                />
              </FieldGroup>

              <FieldGroup
                label="Contraseña"
                error={errors.password?.message}
                required
              >
                <PasswordInput
                  id="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('password')}
                />
              </FieldGroup>
            </div>

            {import.meta.env.DEV && (
              <Alert variant="info" title="Credenciales de prueba (solo desarrollo)">
                <p>
                  <span className="font-medium">Email:</span> admin@test.com
                  <br />
                  <span className="font-medium">Contraseña:</span> admin123
                </p>
              </Alert>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              leftIcon={!isSubmitting ? <LogIn className="h-4 w-4" aria-hidden="true" /> : undefined}
              className="w-full"
            >
              {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
