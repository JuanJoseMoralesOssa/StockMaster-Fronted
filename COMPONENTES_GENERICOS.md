# Sistema de Componentes Genéricos Configurables

Este sistema te permite crear páginas CRUD completas con solo definir una configuración, eliminando la necesidad de escribir código repetitivo.

## 🎯 Componentes Principales

### 1. **GenericPage**

Componente principal que orquesta toda la funcionalidad de una página CRUD.

### 2. **GenericTable**

Tabla configurable con:

- Paginación automática
- Acciones de editar/eliminar
- Acciones personalizadas
- Renderizado personalizado de celdas
- Estados de carga y error

### 3. **GenericForm**

Formulario dinámico con:

- Validaciones automáticas y personalizadas
- Soporte para múltiples tipos de campos
- Toggle de contraseña
- Mensajes de error
- Estados de carga

### 4. **GenericHeader**

Header configurable con:

- Título personalizable
- Botón de crear con modal
- Estilos personalizables

## 📝 Cómo Usar

### Paso 1: Crear la Configuración

Crea un archivo de configuración en `src/config/` (ej: `userPageConfig.ts`):

\`\`\`typescript
import { GenericPageConfig } from '../types/GenericConfig'
import User from '../types/User'
import { userService } from '../services/User'

export const userPageConfig: GenericPageConfig<User> = {
// Información básica
entityName: 'Usuario',
entityNamePlural: 'Usuarios',
idField: 'id',

    // Definir columnas de la tabla
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
            render: (user) => getRoleDisplayName(user.role), // Renderizado personalizado
        },
    ],

    // Definir campos del formulario
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
                { value: 'admin', label: 'Admin' },
                { value: 'user', label: 'Usuario' },
            ],
        },
    ],

    // Configurar acciones
    actions: {
        canEdit: true,
        canDelete: true,
    },

    // Servicio para operaciones CRUD
    service: userService,

    // (Opcional) Preparar datos antes de enviar
    prepareDataForSubmit: async (data, isEdit) => {
        // Ej: hashear contraseña
        if (data.password) {
            data.password = await hashPassword(data.password)
        }
        return data
    },

}
\`\`\`

### Paso 2: Usar en tu Página

En tu componente de página (ej: `User.tsx`):

\`\`\`typescript
import GenericPage from '../generic_page/GenericPage'
import { userPageConfig } from '../../config/userPageConfig'

function User() {
return <GenericPage config={userPageConfig} />
}

export default User
\`\`\`

¡Eso es todo! 🎉

## 🔧 Configuración Avanzada

### Tipos de Campos Soportados

- **text**: Campo de texto simple
- **email**: Campo de email con validación
- **password**: Campo de contraseña con toggle show/hide
- **number**: Campo numérico con min/max
- **select**: Lista desplegable
- **textarea**: Área de texto multilínea
- **date**: Selector de fecha
- **checkbox**: Casilla de verificación

### Ejemplo de Campo con Validación Personalizada

\`\`\`typescript
{
name: 'age',
label: 'Edad',
type: 'number',
required: true,
min: 18,
max: 100,
validate: (value) => {
if (value < 18) {
return 'Debes ser mayor de 18 años'
}
return undefined
},
}
\`\`\`

### Renderizado Personalizado de Columnas

\`\`\`typescript
{
key: 'stock',
label: 'Stock',
render: (product) => {
const stock = product.stock ?? 0
const className = stock < 10
? 'text-red-600 font-semibold'
: 'text-green-600'
return <span className={className}>{stock}</span>
},
}
\`\`\`

### Acciones Personalizadas

\`\`\`typescript
actions: {
canEdit: true,
canDelete: true,
customActions: [
{
icon: <Eye className='h-4 w-4' />,
label: 'Ver Detalles',
onClick: (item) => {
console.log('Ver:', item)
},
className: 'text-blue-600',
condition: (item) => item.active, // Mostrar solo si está activo
},
],
}
\`\`\`

### Ocultar Columnas en Móvil

\`\`\`typescript
{
key: 'description',
label: 'Descripción',
hideOnMobile: true, // Se oculta en pantallas pequeñas
}
\`\`\`

## 🎨 Personalización

### Cambiar Mensajes de Éxito

\`\`\`typescript
export const myConfig: GenericPageConfig<MyType> = {
// ... resto de la configuración
createSuccessMessage: 'Elemento creado con éxito',
updateSuccessMessage: 'Elemento actualizado correctamente',
deleteSuccessMessage: 'Elemento eliminado exitosamente',
}
\`\`\`

### Personalizar el Botón de Crear

\`\`\`typescript
renderCreateButton: (onClick) => (
<button
        onClick={onClick}
        className="bg-green-500 text-white px-4 py-2 rounded"> + Agregar Nuevo
</button>
)
\`\`\`

## 🏗️ Arquitectura de Composición vs Configuración

La versión actual de `GenericPage` utiliza **Composition Patterns** y React Context. Un diseño típico se ve así:

```tsx
import GenericPage from '../generic_page/GenericPage'
import { myConfig } from './myConfig'

export default function MyPage() {
  return (
    <GenericPage config={myConfig}>
      <GenericPage.Header config={myConfig} />
      <GenericPage.Filters config={myConfig} />
      <GenericPage.Table config={myConfig} />
      <GenericPage.DetailsModal config={myConfig} />
    </GenericPage>
  )
}
```

Esto permite cambiar el orden, inyectar capas intermedias (como alertas exclusivas), y evita modificar el archivo principal `GenericPage.tsx` al escalar.

## 📦 Estructura de Archivos

```
src/
├── config/             # Configuraciones de páginas
│   ├── userPageConfig.ts
│   ├── productPageConfig.tsx
│   └── ...
├── types/
│   └── GenericConfig.ts # Interfaces de configuración
├── pages/
│   ├── generic_page/    # Componentes genéricos
│   │   ├── GenericPage.tsx # Context Provider (Wrapper principal)
│   │   └── components/
│   │       ├── page/       # Compound components (PageHeader, PageTable, etc)
│   │       ├── generic_table/
│   │       └── generic_form/
│   ├── user/
│   │   └── User.tsx     # ~12 líneas usando composición
│   └── product/
│       └── Product.tsx  # ~12 líneas usando composición
```

## ✨ Beneficios

1. **Menos código**: De ~400 líneas a ~7 líneas por página
2. **Reutilizable**: Un solo componente para todas las entidades
3. **Mantenible**: Cambios en un lugar afectan todas las páginas
4. **Tipado**: TypeScript garantiza seguridad de tipos
5. **Flexible**: Personalizable según necesidades específicas
6. **Consistente**: UI/UX uniforme en toda la aplicación

## 🚀 Próximos Pasos

Para crear una nueva página CRUD:

1. Crea tu tipo/interfaz en `src/types/`
2. Crea tu servicio en `src/services/`
3. Crea la configuración en `src/config/`
4. Crea tu página con 7 líneas de código
5. ¡Listo! 🎉

## 📚 Ejemplos Completos

Ver:

- [userPageConfig.ts](../config/userPageConfig.ts) - Ejemplo con hash de contraseña
- [productPageConfig.tsx](../config/productPageConfig.tsx) - Ejemplo con acciones personalizadas y renderizado condicional
