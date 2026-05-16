import { GenericPageConfig } from '../types/GenericConfig'
import User from '../types/User'
import { UserFilters, userService } from '../services/User'
import { Roles } from '../enums/Roles'
import UserFiltersComponent from '../pages/user/components/UserFilters'
import bcrypt from 'bcryptjs'

const getRoleDisplayName = (role: string): string => {
  if (role === Roles.ADMIN) return 'Admin'
  if (role === Roles.OFFICE) return 'Oficina'
  return 'Operador'
}

export const userPageConfig: GenericPageConfig<User, UserFilters> = {
  entityName: 'Usuario',
  entityNamePlural: 'Usuarios',
  idField: 'id',
  initialFilterState: {
    name: '',
    email: '',
    role: '',
  },

  columns: [
    {
      key: 'name',
      label: 'Usuario',
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'role',
      label: 'Rol',
      render: (user) => getRoleDisplayName(user.role),
    },
  ],

  formFields: [
    {
      name: 'name',
      label: 'Nombre',
      type: 'text',
      placeholder: 'Ej: Juan Pérez',
      required: true,
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'usuario@ejemplo.com',
      required: true,
    },
    {
      name: 'role',
      label: 'Rol',
      type: 'select',
      required: true,
      options: [
        { value: Roles.ADMIN, label: 'Admin' },
        { value: Roles.OFFICE, label: 'Oficina' },
        { value: Roles.OPERATOR, label: 'Operador' },
      ],
    },
    {
      name: 'password',
      label: 'Contraseña',
      type: 'password',
      placeholder: 'Mínimo 6 caracteres',
      required: false, // No requerido en edición
      showPasswordToggle: true,
      validate: (value) => {
        // Si hay valor, validar longitud
        if (value && typeof value === 'string' && value.length < 6) {
          return 'La contraseña debe tener al menos 6 caracteres'
        }
        return undefined
      },
    },
  ],

  actions: {
    canEdit: true,
    canDelete: true,
  },

  updatePartial: true,

  service: userService,

  renderCustomFilters: UserFiltersComponent,

  prepareDataForSubmit: async (data: Partial<User>, isEdit) => {
    const preparedData = { ...data }

    // Si hay contraseña, hashearla
    if (preparedData.password && preparedData.password.length > 0) {
      const salt = bcrypt.genSaltSync(10)
      preparedData.password = bcrypt.hashSync(preparedData.password, salt)
    } else if (isEdit) {
      // Si es edición y no hay contraseña, no enviarla
      delete preparedData.password
    }

    return preparedData
  },

  validateData: async (data: Partial<User>) => {
    // Validación adicional: contraseña requerida solo en creación
    if (!data.id && !data.password) {
      return 'La contraseña es requerida para crear un nuevo usuario'
    }
    return undefined
  },

  createSuccessMessage: 'Usuario creado exitosamente',
  updateSuccessMessage: 'Usuario actualizado exitosamente',
  deleteSuccessMessage: 'Usuario eliminado exitosamente',
}
