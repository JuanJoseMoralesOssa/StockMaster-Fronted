# Ejemplo: Crear una Nueva Página CRUD Completa

## Escenario

Queremos crear una página para gestionar **Categorías** de productos.

## Paso 1: Definir el Tipo

Crea `src/types/Category.ts`:

\`\`\`typescript
export default interface Category {
id?: number
name: string
description?: string
active: boolean
createdAt?: string
}
\`\`\`

## Paso 2: Crear el Servicio

Crea `src/services/CategoryService.ts`:

\`\`\`typescript
import Category from '../types/Category'
import { PaginatedResponse } from '../types/PaginatedResponse'
import { ApiService } from './ApiService'

export class CategoryService extends ApiService<Category> {
constructor() {
super('categories') // Endpoint de tu API
}

    async getAllPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Category>> {
        return this.getPaginated(page, limit)
    }

}

export const categoryService = new CategoryService()
\`\`\`

## Paso 3: Crear la Configuración

Crea `src/config/categoryPageConfig.tsx`:

\`\`\`typescript
import { GenericPageConfig } from '../types/GenericConfig'
import Category from '../types/Category'
import { categoryService } from '../services/CategoryService'
import { Tag, CheckCircle, XCircle } from 'lucide-react'

export const categoryPageConfig: GenericPageConfig<Category> = {
entityName: 'Categoría',
entityNamePlural: 'Categorías',
idField: 'id',

    // Configurar columnas de la tabla
    columns: [
        {
            key: 'name',
            label: 'Nombre',
            render: (category) => (
                <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{category.name}</span>
                </div>
            ),
        },
        {
            key: 'description',
            label: 'Descripción',
            hideOnMobile: true, // Se oculta en móviles
        },
        {
            key: 'active',
            label: 'Estado',
            width: 'w-32',
            render: (category) => (
                <span className={\`flex items-center gap-1 \${category.active ? 'text-green-600' : 'text-red-600'}\`}>
                    {category.active ? (
                        <>
                            <CheckCircle className="h-4 w-4" />
                            Activa
                        </>
                    ) : (
                        <>
                            <XCircle className="h-4 w-4" />
                            Inactiva
                        </>
                    )}
                </span>
            ),
        },
    ],

    // Configurar campos del formulario
    formFields: [
        {
            name: 'name',
            label: 'Nombre de la Categoría',
            type: 'text',
            placeholder: 'Ej: Electrónica',
            required: true,
            validate: (value) => {
                if (value && value.length < 3) {
                    return 'El nombre debe tener al menos 3 caracteres'
                }
                if (value && value.length > 50) {
                    return 'El nombre no puede exceder 50 caracteres'
                }
                return undefined
            },
        },
        {
            name: 'description',
            label: 'Descripción',
            type: 'textarea',
            placeholder: 'Descripción opcional de la categoría',
            required: false,
        },
        {
            name: 'active',
            label: 'Categoría activa',
            type: 'checkbox',
            defaultValue: true,
        },
    ],

    // Configurar acciones disponibles
    actions: {
        canEdit: true,
        canDelete: true,
        customActions: [
            {
                icon: <Tag className='mr-2 h-4 w-4' />,
                label: 'Ver Productos',
                onClick: (category) => {
                    console.log('Ver productos de:', category.name)
                    // navigate(\`/products?categoryId=\${category.id}\`)
                },
                className: 'text-blue-600 focus:text-blue-700',
            },
        ],
    },

    // Vincular el servicio
    service: categoryService,

    // (Opcional) Procesar datos antes de enviar
    prepareDataForSubmit: async (data, isEdit) => {
        // Limpiar espacios del nombre
        if (data.name) {
            data.name = data.name.trim()
        }

        // Asegurar que active sea booleano
        if (data.active === undefined) {
            data.active = true
        }

        return data
    },

    // (Opcional) Validaciones adicionales
    validateData: async (data) => {
        // Aquí podrías validar contra el backend
        // Por ejemplo, verificar que no exista otra categoría con el mismo nombre
        return undefined
    },

    // Mensajes personalizados
    createSuccessMessage: 'Categoría creada exitosamente',
    updateSuccessMessage: 'Categoría actualizada correctamente',
    deleteSuccessMessage: 'Categoría eliminada con éxito',

}
\`\`\`

## Paso 4: Crear la Página

Crea `src/pages/category/Category.tsx`:

\`\`\`typescript
import GenericPage from '../generic_page/GenericPage'
import { categoryPageConfig } from '../../config/categoryPageConfig'

function Category() {
return (
<GenericPage config={categoryPageConfig}>
<GenericPage.Header config={categoryPageConfig} />
<GenericPage.Filters config={categoryPageConfig} />
<GenericPage.Table config={categoryPageConfig} />
<GenericPage.DetailsModal config={categoryPageConfig} />
</GenericPage>
)
}

export default Category
\`\`\`

## Paso 5: Agregar la Ruta

En tu archivo de rutas (ej: `App.tsx` o `router.tsx`):

\`\`\`typescript
import Category from './pages/category/Category'

// ...en tus rutas:
<Route path="/categories" element={<Category />} />
\`\`\`

## ¡Listo! 🎉

Has creado una página CRUD completa con:

- ✅ Lista paginada
- ✅ Crear categoría con validaciones
- ✅ Editar categoría
- ✅ Eliminar categoría con confirmación
- ✅ Renderizado personalizado (iconos, colores)
- ✅ Campos opcionales y requeridos
- ✅ Validaciones automáticas y personalizadas
- ✅ Estados de carga y error
- ✅ Responsive (oculta descripción en móvil)
- ✅ Acciones personalizadas

**Total de código escrito**: ~150 líneas de configuración + 7 líneas para la página

**Sin componentes genéricos**: Habrías necesitado ~800+ líneas de código repetitivo

---

## 💡 Consejos Avanzados

### 1. Validación Asíncrona

\`\`\`typescript
validateData: async (data) => {
// Verificar si el nombre ya existe
const exists = await categoryService.checkIfExists(data.name)
if (exists) {
return 'Ya existe una categoría con ese nombre'
}
return undefined
}
\`\`\`

### 2. Campos Dependientes

\`\`\`typescript
formFields: [
{
name: 'hasDiscount',
label: '¿Tiene descuento?',
type: 'checkbox',
},
{
name: 'discountPercentage',
label: 'Porcentaje de descuento',
type: 'number',
min: 0,
max: 100,
// Solo visible si hasDiscount es true
// Puedes implementar lógica condicional en el formulario
},
]
\`\`\`

### 3. Formato de Fecha

\`\`\`typescript
{
key: 'createdAt',
label: 'Fecha de Creación',
render: (item) => {
return new Date(item.createdAt).toLocaleDateString('es-ES')
},
}
\`\`\`

### 4. Botón Personalizado

\`\`\`typescript
renderCreateButton: (onClick) => (
<button
        onClick={onClick}
        className="flex items-center gap-2 bg-linear-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all">
<Plus className="h-5 w-5" />
Nueva Categoría
</button>
)
\`\`\`

## 🔥 Casos de Uso Avanzados

### Filtrar por Estado

\`\`\`typescript
columns: [
{
key: 'active',
label: 'Estado',
render: (item) => {
// Agregar filtro
const handleFilter = () => {
// Implementar lógica de filtro
}

            return (
                <button onClick={handleFilter}>
                    {item.active ? '✅ Activa' : '❌ Inactiva'}
                </button>
            )
        },
    },

]
\`\`\`

### Confirmar Antes de Editar

\`\`\`typescript
actions: {
canEdit: true,
customActions: [
{
icon: <Lock className="h-4 w-4" />,
label: 'Editar (requiere confirmación)',
onClick: async (item) => {
const confirmed = await confirm('¿Seguro que quieres editar?')
if (confirmed) {
// Abrir modal de edición
}
},
condition: (item) => item.locked === true,
},
],
}
\`\`\`
