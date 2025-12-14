import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { Modal } from '../../components/modal/Modal'
import Pagination from '../../components/pagination/Pagination'
import { useToast } from '../../../hooks/useToast'
import { GenericColumn, GenericActions, GenericField } from '../../../types/GenericConfig'
import GenericForm from './GenericForm'

interface GenericTableProps<T> {
  data: T[]
  loading: boolean
  error: string | null
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  goToPage: (page: number) => void
  setItemsPerPage: (limit: number) => void
  refresh: () => void
  updateItem: (updatedItem: T, idField?: keyof T) => void
  removeItem: (itemId: string | number, idField?: keyof T) => void

  // Configuración
  columns: GenericColumn<T>[]
  actions?: GenericActions<T>
  idField: keyof T
  entityName: string

  // Callbacks para operaciones
  onDelete: (id: number | string) => Promise<void>
  onUpdate?: (id: number | string, data: Partial<T>) => Promise<T>

  // Renderizado personalizado para el formulario de edición
  renderEditForm?: (item: T, onSuccess: () => void, onCancel: () => void) => React.ReactNode

  // Campos del formulario (si se usa el formulario genérico)
  formFields?: GenericField<T>[]
  prepareDataForSubmit?: (data: Partial<T>, isEdit: boolean) => Promise<Partial<T>>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function GenericTable<T extends Record<string, any>>({
  data,
  loading,
  error,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  goToPage,
  setItemsPerPage,
  updateItem,
  removeItem,
  columns,
  actions = { canEdit: true, canDelete: true },
  idField,
  entityName,
  onDelete,
  onUpdate,
  renderEditForm,
  formFields,
  prepareDataForSubmit
}: Readonly<GenericTableProps<T>>) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<T | null>(null)
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { showSuccess, showError, confirmDelete } = useToast()

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownIndex(null)
        setDropdownPosition(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cerrar dropdown al hacer scroll
  useEffect(() => {
    const handleScroll = () => {
      if (openDropdownIndex !== null) {
        setOpenDropdownIndex(null)
        setDropdownPosition(null)
      }
    }
    window.addEventListener('scroll', handleScroll, true)
    return () => window.removeEventListener('scroll', handleScroll, true)
  }, [openDropdownIndex])

  const handleDropdownToggle = (rowIndex: number, event: React.MouseEvent<HTMLButtonElement>) => {
    if (openDropdownIndex === rowIndex) {
      setOpenDropdownIndex(null)
      setDropdownPosition(null)
    } else {
      const button = event.currentTarget
      const rect = button.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.right - 176 // 176px = w-44 (11rem)
      })
      setOpenDropdownIndex(rowIndex)
    }
  }

  const handleDelete = async (item: T) => {
    const itemId = item[idField] as string | number
    const confirmed = await confirmDelete(
      `¿Estás seguro de que deseas eliminar este ${entityName}?`,
      `Eliminar ${entityName}`
    )

    if (!confirmed) return

    try {
      await onDelete(itemId)
      removeItem(itemId, idField)
      showSuccess(`${entityName} eliminado exitosamente`, 'Eliminación exitosa')
    } catch (error) {
      showError(`Error al eliminar ${entityName}`, 'Error')
      console.error(`Error deleting ${entityName}:`, error)
    }
  }

  const handleEdit = (item: T) => {
    setSelectedItem(item)
    setIsEditModalOpen(true)
  }

  const handleEditSuccess = (updatedItem: T) => {
    updateItem(updatedItem, idField)
    setIsEditModalOpen(false)
    setSelectedItem(null)
    showSuccess(`${entityName} actualizado exitosamente`, 'Actualización exitosa')
  }

  const getCellValue = (item: T, column: GenericColumn<T>) => {
    if (column.render) {
      return column.render(item)
    }

    const value = item[column.key as keyof T]
    if (value === null || value === undefined) return '-'

    // Si es un booleano, mostrar Sí/No
    if (typeof value === 'boolean') {
      return value ? 'Sí' : 'No'
    }

    return String(value)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Error: {error}</p>
      </div>
    )
  }

  const showActions = actions.canEdit || actions.canDelete || (actions.customActions && actions.customActions.length > 0)

  return (
    <>
      <div className='overflow-x-auto rounded-lg shadow-md'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-linear-to-r from-gray-50 to-gray-100'>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${column.hideOnMobile ? 'hidden md:table-cell' : ''} ${column.width || ''}`}
                >
                  {column.label}
                </th>
              ))}
              {showActions && (
                <th className='px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (showActions ? 1 : 0)}
                  className='px-6 py-8 text-center text-gray-500'
                >
                  No hay datos disponibles
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => (
                <tr
                  key={rowIndex}
                  className='hover:bg-gray-50 transition-colors duration-150'
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${column.hideOnMobile ? 'hidden md:table-cell' : ''}`}
                    >
                      {getCellValue(item, column)}
                    </td>
                  ))}
                  {showActions && (
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-center'>
                      <div className='inline-flex items-center justify-center gap-1'>
                        {/* Editar - siempre visible */}
                        {actions.canEdit && onUpdate && (
                          <button
                            type='button'
                            onClick={() => handleEdit(item)}
                            className='inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-gray-700 hover:bg-gray-100 transition-colors'
                            title='Editar'
                          >
                            <Pencil className='h-4 w-4' />
                            <span className='hidden lg:inline text-sm'>Editar</span>
                          </button>
                        )}

                        {/* Eliminar - siempre visible (tiene modal de confirmación) */}
                        {actions.canDelete && (
                          <button
                            type='button'
                            onClick={() => handleDelete(item)}
                            className='inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-red-600 hover:bg-red-50 transition-colors'
                            title='Eliminar'
                          >
                            <Trash2 className='h-4 w-4' />
                            <span className='hidden lg:inline text-sm'>Eliminar</span>
                          </button>
                        )}

                        {/* Dropdown para acciones adicionales */}
                        {actions.customActions && actions.customActions.length > 0 && (
                          <div className='relative'>
                            <button
                              type='button'
                              onClick={(e) => handleDropdownToggle(rowIndex, e)}
                              className='inline-flex items-center justify-center rounded-md p-1.5 text-gray-500 hover:bg-gray-100 transition-colors'
                              title='Más opciones'
                            >
                              <MoreVertical className='h-4 w-4' />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Dropdown portal - renderizado fuera de la tabla para evitar overflow issues */}
      {openDropdownIndex !== null && dropdownPosition && actions?.customActions && (
        <div
          ref={dropdownRef}
          className='fixed z-50 w-44 rounded-md bg-white shadow-lg ring-1 ring-black/5'
          style={{ top: dropdownPosition.top, left: Math.max(8, dropdownPosition.left) }}
        >
          <div className='flex flex-col py-1'>
            {actions.customActions.map((action, actionIndex) => {
              const item = data[openDropdownIndex]
              if (!item) return null
              if (action.condition && !action.condition(item)) {
                return null
              }
              return (
                <button
                  key={actionIndex}
                  type='button'
                  onClick={() => {
                    action.onClick(item)
                    setOpenDropdownIndex(null)
                    setDropdownPosition(null)
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors flex items-center gap-2 ${action.className || 'text-gray-700'}`}
                >
                  {action.icon}
                  {action.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={goToPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      {/* Modal de edición */}
      {selectedItem && (
        <Modal
          open={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedItem(null)
          }}
          title={`Editar ${entityName}`}
          description={`Actualiza la información del ${entityName}`}
          className="sm:max-w-150"
        >
          {renderEditForm ? (
            renderEditForm(
              selectedItem,
              () => setIsEditModalOpen(false),
              () => {
                setIsEditModalOpen(false)
                setSelectedItem(null)
              }
            )
          ) : formFields && onUpdate ? (
            <GenericForm<T>
              fields={formFields}
              initialData={selectedItem}
              onSubmit={async (formData: Partial<T>) => {
                let dataToSubmit = formData
                if (prepareDataForSubmit) {
                  dataToSubmit = await prepareDataForSubmit(formData, true)
                }
                const updated = await onUpdate(selectedItem[idField] as string | number, dataToSubmit)
                handleEditSuccess(updated)
              }}
              onCancel={() => {
                setIsEditModalOpen(false)
                setSelectedItem(null)
              }}
              submitLabel="Actualizar"
            />
          ) : (
            <p>No hay formulario de edición configurado</p>
          )}
        </Modal>
      )}
    </>
  )
}
