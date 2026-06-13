import { LogOut, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge, Button } from '../../../components/ui'
import useAuthStore from '../../../stores/useAuthStore'

export default function NoAssignedModules() {
  const navigate = useNavigate()
  const { logout, user } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <section className="mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-3xl flex-col items-center justify-center px-4 py-12 text-center sm:px-6 md:min-h-dvh">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-lg border border-(--color-border) bg-(--color-bg-surface) text-(--color-text-secondary) shadow-xs">
        <ShieldCheck className="h-7 w-7" aria-hidden="true" />
      </div>

      <Badge variant="outline" withDot className="mb-4">
        {user?.role ?? 'Sin rol'}
      </Badge>

      <h1 className="text-2xl font-semibold tracking-tight text-(--color-text-primary) sm:text-3xl">
        No hay modulos asignados
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-(--color-text-secondary)">
        Tu sesion esta activa, pero este rol todavia no tiene pantallas operativas disponibles.
        Solicita a un administrador que ajuste tus permisos si necesitas acceder al inventario.
      </p>

      <div className="mt-7 flex w-full max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
        <Button
          type="button"
          variant="secondary"
          onClick={handleLogout}
          leftIcon={<LogOut className="h-4 w-4" aria-hidden="true" />}
          className="w-full sm:w-auto"
        >
          Cerrar sesion
        </Button>
      </div>
    </section>
  )
}
