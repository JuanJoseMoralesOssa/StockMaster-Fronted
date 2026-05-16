import type { SelectHTMLAttributes } from 'react'
import { Search, X } from 'lucide-react'
import { Button, FieldGroup, Input } from '../../../components/ui'
import { Roles } from '../../../enums/Roles'
import type { UserFilters as UserFiltersState } from '../../../services/User'

interface UserFiltersProps {
  filters: UserFiltersState
  setFilters: (filters: UserFiltersState) => void
  onSearch: () => void
  onClear: () => void
  loading?: boolean
}

interface RoleSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean
}

const roleOptions = [
  { value: '', label: 'Todos los roles' },
  { value: Roles.ADMIN, label: 'Admin' },
  { value: Roles.OFFICE, label: 'Oficina' },
  { value: Roles.OPERATOR, label: 'Operador' },
]

function RoleSelect({ hasError: _hasError, ...props }: Readonly<RoleSelectProps>) {
  return (
    <select
      className="h-input w-full rounded-md border border-(--color-border) bg-(--color-bg-surface) px-3 text-sm text-(--color-text-primary) transition-colors hover:border-(--color-border-strong) focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus-ring)"
      {...props}
    />
  )
}

export default function UserFilters({ filters, setFilters, onSearch, onClear, loading = false }: Readonly<UserFiltersProps>) {
  return (
    <form
      className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
      onSubmit={(event) => {
        event.preventDefault()
        onSearch()
      }}
    >
      <div className="grid w-full gap-4 md:grid-cols-3">
        <FieldGroup label="Usuario">
          <Input
            value={filters.name}
            onChange={(event) => setFilters({ ...filters, name: event.target.value })}
            placeholder="Nombre de usuario"
            aria-label="Filtrar usuarios por nombre"
          />
        </FieldGroup>

        <FieldGroup label="Email">
          <Input
            type="email"
            value={filters.email}
            onChange={(event) => setFilters({ ...filters, email: event.target.value })}
            placeholder="usuario@ejemplo.com"
            aria-label="Filtrar usuarios por email"
          />
        </FieldGroup>

        <FieldGroup label="Rol">
          <RoleSelect
            value={filters.role}
            onChange={(event) => setFilters({ ...filters, role: event.target.value })}
            aria-label="Filtrar usuarios por rol"
          >
            {roleOptions.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </RoleSelect>
        </FieldGroup>
      </div>

      <div className="flex w-full flex-col gap-2 sm:w-fit sm:flex-row sm:justify-end">
        <Button
          type="submit"
          className="w-full sm:w-fit"
          loading={loading}
          leftIcon={<Search className="h-4 w-4" />}
        >
          Buscar
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="w-full sm:w-fit"
          disabled={loading}
          leftIcon={<X className="h-4 w-4" />}
          onClick={onClear}
        >
          Limpiar
        </Button>
      </div>
    </form>
  )
}
