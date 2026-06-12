import { useNavigate } from 'react-router-dom'
import { Button } from '../../../components/ui'

function AccessDenied() {
  const navigate = useNavigate()

  return (
    <div className="grid min-h-[70dvh] place-content-center bg-(--color-bg-page) px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto h-12 w-12 text-danger-500">
            {/* Icono de prohibido */}
            <svg
              className="h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636 5.636 18.364"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-(--color-text-primary)">
            Acceso Denegado
          </h2>
          <p className="mt-2 text-sm text-(--color-text-secondary)">
            No tienes permisos suficientes para acceder a esta página
          </p>
        </div>

        <div className="space-y-4 flex flex-col">
          <Button
            variant="primary"
            onClick={() => navigate(-1)}
            className="w-full"
          >
            Volver atrás
          </Button>

          <Button
            variant="secondary"
            onClick={() => navigate('/')}
            className="w-full"
          >
            Ir al inicio
          </Button>
        </div>

        <div className="text-sm text-(--color-text-muted)">
          Si crees que esto es un error, contacta con el administrador del sistema.
        </div>
      </div>
    </div>
  )
}

export default AccessDenied
