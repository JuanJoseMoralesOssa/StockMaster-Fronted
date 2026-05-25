import React, { useState } from 'react'
import { Inbox } from 'lucide-react'
import GenericTableHeader from './GenericTableHeader'
import GenericTableBody from './GenericTableBody'

import { useTableActions } from './useTableActions'
import { GenericActions, GenericColumn, GenericField } from '../../../../types/GenericConfig'
import { useDropdown } from '../../../components/dropdown/useDropdown'
import DropdownMenu from '../../../components/dropdown/DropdownMenu'
import Pagination from '../../../components/pagination/Pagination'
import EditModal from '../EditModal'
import { Alert, Button, EmptyState, TableSkeleton } from '../../../../components/ui'

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
  // Retry function to re-run the last paginated request
  retry?: () => Promise<unknown>

  // Configuración
  columns: GenericColumn<T>[]
  rowClassName?: (item: T) => string
  actions?: GenericActions<T>
  idField: keyof T
  entityName: string

  // Callbacks para operaciones
  onDelete: (id: number | string) => Promise<void>
  onUpdate?: (id: number | string, data: Partial<T>) => Promise<T>

  // Renderizado personalizado para el formulario de edición
  renderEditForm?: (item: T, onSuccess: () => void, onItemUpdated: (item: T) => void) => React.ReactNode

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
  retry,
  columns,
  rowClassName,
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
  const showLoadingSkeleton = loading && (!data || data.length === 0)

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
    deletingItemId,
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

  if (showLoadingSkeleton) {
    return <TableSkeleton rows={5} cols={Math.max(columns.length, 3)} />
  }

  if (error) {
    return (
      <Alert
        variant="danger"
        title="No se pudo cargar la información"
        action={
          retry && (
            <Button variant="primary" size="sm" onClick={() => retry()}>
              Reintentar
            </Button>
          )
        }
      >
        {error}
      </Alert>
    )
  }

  const showActions: boolean = Boolean(actionsWithDefaults.canEdit || actionsWithDefaults.canDelete || (actionsWithDefaults.customActions && actionsWithDefaults.customActions.length > 0))

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={<Inbox aria-hidden="true" />}
        title={`No hay ${entityName.toLowerCase()} para mostrar`}
        description="Cuando se creen registros aparecerán aquí."
      />
    )
  }

  return (
    <>
      <div className='overflow-hidden rounded-lg border border-(--color-border) bg-(--color-bg-surface) shadow-xs'>
        <div className='overflow-x-auto'>
          <table className='w-full min-w-180 divide-y divide-(--color-border)'>
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
              rowClassName={rowClassName}
              expandableConfig={expandableConfig}
            expandedRows={expandedRows}
            toggleRowExpansion={toggleRowExpansion}
            idField={idField}
            deletingItemId={deletingItemId}
          />
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={goToPage}
          onItemsPerPageChange={setItemsPerPage}
        />
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
