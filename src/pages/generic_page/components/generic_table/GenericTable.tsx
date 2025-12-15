import React, { useState } from 'react'
import GenericTableHeader from './GenericTableHeader'
import GenericTableBody from './GenericTableBody'

import { useTableActions } from './useTableActions'
import { GenericActions, GenericColumn, GenericField } from '../../../../types/GenericConfig'
import { useDropdown } from '../../../components/dropdown/useDropdown'
import DropdownMenu from '../../../components/dropdown/DropdownMenu'
import Pagination from '../../../components/pagination/Pagination'
import EditModal from '../EditModal'

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

  // Configuración para filas expandibles
  expandableConfig?: {
    renderExpandedContent: (item: T) => React.ReactNode
    expandedTitle?: (item: T) => string
  }
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
  prepareDataForSubmit,
  expandableConfig
}: Readonly<GenericTableProps<T>>) {
  const actionsWithDefaults = actions || { canEdit: true, canDelete: true }
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set())
  const { openDropdownIndex, dropdownPosition, dropdownRef, handleDropdownToggle, closeDropdown } = useDropdown()

  const toggleRowExpansion = (id: string | number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const {
    isEditModalOpen,
    selectedItem,
    handleDelete,
    handleEdit,
    handleEditSuccess,
    closeEditModal
  } = useTableActions<T>(
    entityName,
    onDelete,
    updateItem,
    removeItem
  )

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

  const showActions: boolean = Boolean(actionsWithDefaults.canEdit || actionsWithDefaults.canDelete || (actionsWithDefaults.customActions && actionsWithDefaults.customActions.length > 0))

  return (
    <>
      <div className='overflow-x-auto rounded-lg shadow-md'>
        <table className='min-w-full divide-y divide-gray-200 '>
          <GenericTableHeader
            columns={columns}
            showActions={showActions}
            hasExpandable={!!expandableConfig}
          />
          <GenericTableBody
            data={data}
            columns={columns}
            showActions={showActions}
            actions={actionsWithDefaults as GenericActions<T>}
            onEdit={handleEdit}
            onDelete={(item) => handleDelete(item, idField)}
            onDropdownToggle={handleDropdownToggle}
            expandableConfig={expandableConfig}
            expandedRows={expandedRows}
            toggleRowExpansion={toggleRowExpansion}
            idField={idField}
          />
        </table>
      </div>

      <DropdownMenu
        openDropdownIndex={openDropdownIndex}
        dropdownPosition={dropdownPosition}
        dropdownRef={dropdownRef}
        actions={actionsWithDefaults as GenericActions<T>}
        data={data as T[]}
        onExecuteAction={(actionIndex, item) => {
          const action = actionsWithDefaults?.customActions?.[actionIndex]
          if (!action) return
          action.onClick(item)
          closeDropdown()
        }}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={goToPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      <EditModal
        isOpen={isEditModalOpen}
        selectedItem={selectedItem}
        entityName={entityName}
        renderEditForm={renderEditForm}
        formFields={formFields}
        onUpdate={onUpdate}
        prepareDataForSubmit={prepareDataForSubmit}
        onEditSuccess={(updatedItem) => handleEditSuccess(updatedItem, idField)}
        onClose={closeEditModal}
      />

    </>
  )
}
