import { GenericPageConfig } from '../types/GenericConfig'
import Person from '../types/Person'
import { PersonFilters, personService } from '../services/PersonService'
import { Button, FieldGroup, Input } from '../components/ui'
import { Building2, Mail, Phone, Search, X } from 'lucide-react'

export const personPageConfig: GenericPageConfig<Person, PersonFilters> = {
  entityName: 'Proveedor',
  entityNamePlural: 'Proveedores',
  idField: 'id',
  initialFilterState: {
    name: '',
  },

  columns: [
    {
      key: 'name',
      label: 'Nombre del Proveedor',
      render: (person) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-(--color-text-muted)" />
          <span className="font-medium">{person.name}</span>
        </div>
      ),
    },
  ],

  formFields: [
    {
      name: 'name',
      label: 'Nombre del Proveedor',
      type: 'text',
      placeholder: 'Ej: Distribuidora ABC',
      required: true,
      validate: (value) => {
        if (value && typeof value === 'string' && value.length < 3) {
          return 'El nombre debe tener al menos 3 caracteres'
        }
        if (value && typeof value === 'string' && value.length > 100) {
          return 'El nombre no puede exceder 100 caracteres'
        }
        return undefined
      },
    },
  ],

  actions: {
    canEdit: true,
    canDelete: true,
    customActions: [
      {
        icon: <Mail className='mr-2 h-4 w-4' />,
        label: 'Ver Compras',
        onClick: () => undefined,
        className: 'text-(--view-accent-text,var(--color-text-link)) focus:text-(--view-accent-text,var(--color-text-link))',
      },
      {
        icon: <Phone className='mr-2 h-4 w-4' />,
        label: 'Ver Gastos',
        onClick: () => undefined,
        className: 'text-(--view-accent-text,var(--color-text-link)) focus:text-(--view-accent-text,var(--color-text-link))',
      },
    ],
  },

  service: personService,

  updatePartial: true,

  renderCustomFilters: ({ filters, setFilters, onSearch, onClear, loading }) => (
    <form
      className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
      onSubmit={(event) => {
        event.preventDefault()
        onSearch()
      }}
    >
      <div className="w-full md:max-w-md">
        <FieldGroup label="Buscar por nombre">
          <Input
            value={filters.name}
            onChange={(event) => setFilters({ ...filters, name: event.target.value })}
            placeholder="Nombre del proveedor"
            aria-label="Buscar proveedor por nombre"
          />
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
  ),

  prepareDataForSubmit: async (data: Partial<Person>) => {
    // Limpiar espacios extras del nombre
    if (data.name) {
      data.name = data.name.trim()
    }
    return data
  },

  validateData: async () => {
    // Aquí podrías validar que el nombre no esté duplicado
    // consultando el backend
    return undefined
  },

  createSuccessMessage: 'Proveedor creado exitosamente',
  updateSuccessMessage: 'Proveedor actualizado exitosamente',
  deleteSuccessMessage: 'Proveedor eliminado exitosamente',
}
