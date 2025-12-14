import { GenericPageConfig } from '../types/GenericConfig'
import Person from '../types/Person'
import { personService } from '../services/PersonService'
import { Building2, Mail, Phone } from 'lucide-react'

export const personPageConfig: GenericPageConfig<Person> = {
  entityName: 'Proveedor',
  entityNamePlural: 'Proveedores',
  idField: 'id',

  columns: [
    {
      key: 'name',
      label: 'Nombre del Proveedor',
      render: (person) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-gray-500" />
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
        onClick: (person) => {
          console.log('Ver compras de:', person.name)
          // Aquí podrías navegar a las compras del proveedor
          // navigate(`/purchases?personId=${person.id}`)
        },
        className: 'text-blue-600 focus:text-blue-700',
      },
      {
        icon: <Phone className='mr-2 h-4 w-4' />,
        label: 'Ver Gastos',
        onClick: (person) => {
          console.log('Ver gastos de:', person.name)
          // navigate(`/expenses?personId=${person.id}`)
        },
        className: 'text-purple-600 focus:text-purple-700',
      },
    ],
  },

  service: personService,

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
