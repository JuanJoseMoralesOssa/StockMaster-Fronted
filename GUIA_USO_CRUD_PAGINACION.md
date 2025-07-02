# 🚀 Guía Completa: Uso de useCrudWithPagination

## 📋 Resumen

El hook `useCrudWithPagination` implementa una arquitectura SOLID que combina operaciones CRUD con paginación del servidor, manteniendo la responsabilidad única de cada hook mientras proporciona una experiencia de usuario fluida.

## 🎯 Características Principales

### ✅ **Separación de Responsabilidades (SRP)**
- `useCrudOperations`: Solo maneja operaciones CRUD
- `useServerPagination`: Solo maneja paginación
- `useCrudWithPagination`: Orquesta ambos de manera inteligente

### ✅ **Funcionalidades Avanzadas**
- **Actualizaciones Optimistas**: Actualiza la UI inmediatamente
- **Manejo Inteligente de Filtros**: Con debouncing y validación automática
- **Navegación de Páginas**: Maneja páginas vacías automáticamente
- **Validaciones Personalizables**: Para cada operación CRUD
- **Mensajes Contextualizados**: Notificaciones personalizables
- **Manejo de Errores**: Con rollback automático en caso de fallo

## 🏗️ Estructura de Archivos

```
src/hooks/
├── useCrudOperations.ts      # Hook genérico para CRUD
├── useServerPagination.ts    # Hook para paginación
├── useCrudWithPagination.ts  # Hook orquestador principal
└── useToast.ts              # Hook para notificaciones

src/examples/
└── UseUsersWithPaginationExample.tsx  # Ejemplo práctico
```

## 📦 Instalación y Configuración

### 1. Importaciones Necesarias

```typescript
import { 
  useCrudWithPagination, 
  createCrudPaginationConfig, 
  useDebouncedFilters 
} from '../hooks/useCrudWithPagination'
import { yourService } from '../services/YourService'
import { YourType } from '../types/YourType'
```

### 2. Configuración Básica

```typescript
export const useYourEntitiesWithPagination = () => {
  // Configuración específica para tu entidad
  const config = createCrudPaginationConfig(
    'TuEntidad', // Nombre para mensajes
    
    // Función de fetch que maneja filtros y ordenamiento
    async (page: number, limit: number, filters?, sortBy?, sortOrder?) => {
      return yourService.getPaginated(page, limit, filters, sortBy, sortOrder)
    },
    
    yourService, // Servicio CRUD
    
    {
      // Configuración adicional opcional
      validations: { /* validaciones personalizadas */ },
      customMessages: { /* mensajes personalizados */ },
      options: { /* opciones de comportamiento */ }
    }
  )

  return useCrudWithPagination(config)
}
```

## 🔧 Configuración Detallada

### **Validaciones Personalizadas**

```typescript
const config = createCrudPaginationConfig(
  'Usuario',
  fetchFunction,
  userService,
  {
    validations: {
      create: (user) => {
        if (!user.name?.trim()) throw new Error('Nombre requerido')
        if (!user.email?.includes('@')) throw new Error('Email inválido')
      },
      update: (user) => {
        if (!user.id) throw new Error('ID requerido')
        // Validaciones específicas para actualización
      },
      delete: async (id) => {
        // Verificar dependencias antes de eliminar
        const hasDependencies = await checkDependencies(id)
        if (hasDependencies) {
          throw new Error('No se puede eliminar: tiene datos asociados')
        }
      }
    }
  }
)
```

### **Mensajes Personalizados**

```typescript
customMessages: {
  creating: 'Guardando usuario...',
  created: 'Usuario creado exitosamente',
  createError: 'Error al crear usuario',
  updating: 'Actualizando datos...',
  updated: 'Usuario actualizado',
  updateError: 'Error al actualizar',
  deleting: 'Eliminando usuario...',
  deleted: 'Usuario eliminado',
  deleteError: 'Error al eliminar',
  deleteConfirm: '¿Confirmas eliminar este usuario?'
}
```

### **Opciones de Comportamiento**

```typescript
options: {
  autoRefresh: true,           // Auto-refresh cada X segundos
  refreshInterval: 30000,      // Intervalo de refresh (30s)
  optimisticUpdates: true,     // Actualizaciones optimistas
  confirmDelete: true,         // Confirmar antes de eliminar
  defaultSortBy: 'createdAt',  // Campo de ordenamiento por defecto
  defaultSortOrder: 'desc',    // Orden por defecto
  defaultPageSize: 10          // Tamaño de página por defecto
}
```

## 🎮 Uso en Componentes

### **Hook Básico**

```typescript
const MyComponent = () => {
  const {
    // Datos y estado
    data: users,
    loading,
    error,
    
    // Información de paginación
    currentPage,
    totalPages,
    totalItems,
    
    // Operaciones CRUD
    createItem,
    updateItem,
    deleteItem,
    
    // Control de paginación
    goToPage,
    setItemsPerPage,
    
    // Filtros y ordenamiento
    filters,
    applyFilters,
    handleSort,
    
    // Utilidades
    refresh
  } = useUsersWithPagination()

  // Resto del componente...
}
```

### **Filtros con Debounce**

```typescript
const MyComponent = () => {
  const usersPagination = useUsersWithPagination()
  
  // Filtros con debounce automático
  const {
    filters,
    updateFilter,
    clearFilter,
    clearAllFilters
  } = useDebouncedFilters({
    name: '',
    email: '',
    role: ''
  }, 300) // 300ms de debounce

  // Aplicar filtros cuando cambien (con debounce)
  useEffect(() => {
    usersPagination.applyFilters(filters)
  }, [filters])

  return (
    <div>
      <input
        placeholder="Buscar por nombre..."
        value={filters.name}
        onChange={(e) => updateFilter('name', e.target.value)}
      />
      {/* Más filtros... */}
    </div>
  )
}
```

## 🚀 Ejemplos Prácticos

### **1. Crear un Elemento**

```typescript
const handleCreate = async (formData) => {
  const newUser = await createItem({
    name: formData.name,
    email: formData.email,
    role: formData.role
  }, {
    goToFirstPage: true,  // Ir a página 1 después de crear
    showSuccess: true,    // Mostrar notificación de éxito
    revalidate: true      // Refrescar datos
  })

  if (newUser) {
    console.log('Usuario creado:', newUser)
    // El hook maneja automáticamente la actualización de la lista
  }
}
```

### **2. Actualizar un Elemento**

```typescript
const handleUpdate = async (user) => {
  const updatedUser = await updateItem({
    ...user,
    name: 'Nuevo nombre'
  }, {
    optimistic: true,   // Actualización optimista
    revalidate: true    // Revalidar para ver cambios de orden
  })

  if (updatedUser) {
    console.log('Usuario actualizado:', updatedUser)
  }
}
```

### **3. Eliminar un Elemento**

```typescript
const handleDelete = async (userId) => {
  const deleted = await deleteItem(userId, undefined, {
    confirmDelete: true,  // Mostrar confirmación
    customConfirmMessage: '¿Seguro que quieres eliminar este usuario?'
  })

  if (deleted) {
    console.log('Usuario eliminado')
    // El hook maneja automáticamente:
    // - Navegación si la página queda vacía
    // - Actualización del contador total
    // - Rellenado con datos adicionales si es necesario
  }
}
```

### **4. Manejo de Ordenamiento**

```typescript
const MyTable = () => {
  const { users, handleSort, sortBy, sortOrder } = useUsersWithPagination()

  return (
    <table>
      <thead>
        <tr>
          <th onClick={() => handleSort('name')}>
            Nombre {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
          </th>
          <th onClick={() => handleSort('email')}>
            Email {sortBy === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
          </th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.email}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

### **5. Paginación Completa**

```typescript
const MyPagination = () => {
  const {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNext,
    hasPrevious,
    goToPage,
    setItemsPerPage,
    startItem,
    endItem
  } = useUsersWithPagination()

  return (
    <div className="pagination">
      <div className="info">
        Mostrando {startItem} - {endItem} de {totalItems} elementos
      </div>
      
      <div className="controls">
        <button 
          onClick={() => goToPage(currentPage - 1)}
          disabled={!hasPrevious}
        >
          Anterior
        </button>
        
        <span>Página {currentPage} de {totalPages}</span>
        
        <button 
          onClick={() => goToPage(currentPage + 1)}
          disabled={!hasNext}
        >
          Siguiente
        </button>
      </div>

      <select 
        value={itemsPerPage} 
        onChange={(e) => setItemsPerPage(Number(e.target.value))}
      >
        <option value={10}>10 por página</option>
        <option value={25}>25 por página</option>
        <option value={50}>50 por página</option>
      </select>
    </div>
  )
}
```

## 🛠️ Personalización Avanzada

### **Operaciones Específicas del Negocio**

```typescript
export const useUsersWithPagination = () => {
  const usersCrud = useCrudWithPagination(config)

  // Operación específica del negocio
  const resetPassword = async (userId: number) => {
    try {
      await userService.resetPassword(userId)
      usersCrud.refresh() // Refrescar después de la operación
      return true
    } catch (error) {
      console.error('Error al resetear password:', error)
      throw error
    }
  }

  const exportUsers = async () => {
    try {
      const allUsers = await userService.getAll()
      // Lógica de exportación
      return allUsers
    } catch (error) {
      console.error('Error al exportar:', error)
      throw error
    }
  }

  return {
    ...usersCrud,
    // Operaciones adicionales
    resetPassword,
    exportUsers
  }
}
```

### **Hooks Derivados**

```typescript
// Hook específico para admin
export const useAdminUsersWithPagination = () => {
  const usersPagination = useUsersWithPagination()
  
  // Filtrar solo usuarios admin por defecto
  useEffect(() => {
    usersPagination.applyFilters({ role: 'admin' })
  }, [])

  return usersPagination
}

// Hook con configuración específica
export const useUsersTableWithPagination = (pageSize = 25) => {
  const usersPagination = useUsersWithPagination()
  
  useEffect(() => {
    usersPagination.setItemsPerPage(pageSize)
  }, [pageSize])

  return usersPagination
}
```

## 🔍 Debugging y Monitoreo

### **Estados Disponibles**

```typescript
const {
  // Estados de datos
  loading,           // Cargando datos de paginación
  operationLoading,  // Cargando operación CRUD
  error,            // Error de paginación
  operationError,   // Error de operación CRUD
  
  // Estados de utilidad
  isEmpty,          // No hay datos
  isFirstPage,      // Estamos en la primera página
  isLastPage        // Estamos en la última página
} = useUsersWithPagination()

// Ejemplo de uso
if (loading) return <LoadingSpinner />
if (error) return <ErrorMessage error={error} />
if (isEmpty) return <EmptyState />
```

### **Logging Personalizado**

```typescript
const config = createCrudPaginationConfig(
  'Usuario',
  fetchFunction,
  userService,
  {
    validations: {
      create: (user) => {
        console.log('Validando creación:', user)
        // Validaciones...
      }
    },
    options: {
      // Habilitar logs internos si es necesario
    }
  }
)
```

## 🚨 Manejo de Errores

### **Errores de Validación**

```typescript
try {
  await createItem(invalidData)
} catch (error) {
  if (error.message.includes('validación')) {
    // Manejar error de validación
    setFormErrors(error.message)
  }
}
```

### **Errores de Red**

```typescript
const { error, operationError, refresh } = useUsersWithPagination()

useEffect(() => {
  if (error || operationError) {
    // Mostrar botón de reintentar
    console.error('Error detectado:', error || operationError)
  }
}, [error, operationError])

const handleRetry = () => {
  refresh() // Reintentar operación
}
```

## 🎯 Mejores Prácticas

### ✅ **Qué Hacer**

1. **Usar validaciones**: Siempre valida datos antes de enviar
2. **Manejar estados de carga**: Deshabilita botones durante operaciones
3. **Confirmar eliminaciones**: Usa confirmaciones para acciones destructivas
4. **Filtros con debounce**: Usa `useDebouncedFilters` para mejor UX
5. **Manejo de errores**: Siempre maneja errores y muestra mensajes claros

### ❌ **Qué Evitar**

1. **No modificar datos directamente**: Usa las operaciones del hook
2. **No ignorar estados de carga**: Siempre considera loading states
3. **No hacer refetch manual**: El hook maneja automáticamente las actualizaciones
4. **No mezclar responsabilidades**: Mantén la lógica de negocio separada
5. **No hardcodear mensajes**: Usa los mensajes personalizables

## 🔄 Migración desde Hooks Anteriores

### **Desde usePurchaseOperations**

```typescript
// Antes
const { createPurchaseWithDetails } = usePurchaseOperations()

// Después
const { createItem } = usePurchasesWithPagination()
```

### **Desde useServerPagination + operaciones manuales**

```typescript
// Antes
const { data, goToPage } = useServerPagination(...)
const handleCreate = async () => {
  await service.create(...)
  // Refetch manual
  fetchData()
}

// Después
const { data, goToPage, createItem } = usePurchasesWithPagination()
const handleCreate = async () => {
  await createItem(...) // Maneja automáticamente la actualización
}
```

## 🎉 Conclusión

El hook `useCrudWithPagination` proporciona una solución completa y escalable para manejar CRUD + Paginación siguiendo principios SOLID. Su arquitectura modular permite:

- **Reutilización** en múltiples entidades
- **Mantenibilidad** con responsabilidades claras
- **Extensibilidad** para casos específicos
- **Consistencia** en toda la aplicación

¡Ahora tienes una base sólida para manejar todas las operaciones CRUD con paginación en tu aplicación! 🚀
