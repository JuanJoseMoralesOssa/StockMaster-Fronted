import React, { useState } from 'react'
import { Inbox } from 'lucide-react'
import GenericTableHeader from './GenericTableHeader'
import GenericTableBody from './GenericTableBody'
import GenericTableCards from './GenericTableCards'
import { useMediaQuery } from '../../../../hooks/useMediaQuery'

import { useTableActions } from './useTableActions'
import { GenericActions, GenericColumn, GenericField } from '../../../../types/GenericConfig'
import { useDropdown } from '../../../components/dropdown/useDropdown'
import DropdownMenu from '../../../components/dropdown/DropdownMenu'
import Pagination from '../../../components/pagination/Pagination'
import EditModal from '../EditModal'
import { Alert, Button, EmptyState, TableSkeleton } from '../../../../components/ui'
import { useGenericPageContext } from '../page/PageContext'

interface GenericTableProps<T> {
  columns: GenericColumn<T>[]
  rowClassName?: (item: T) => string
  actions?: GenericActions<T>
  idField: keyof T
  entityName: string
  formFields?: GenericField<T>[]
  prepareDataForSubmit?: (data: Partial<T>, isEdit: boolean) => Promise<Partial<T>>
  modalClassName?: string
  expandableConfig?: {
    renderExpandedContent: (item: T) => React.ReactNode
    expandedTitle?: (item: T) => string
  }
  renderEditForm?: (item: T, onSuccess: () => void, onItemUpdated: (item: T) => void) => React.ReactNode
  fetchForEdit?: (id: string | number) => Promise<T>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function GenericTable<T extends Record<string, any>>({
  columns,
  rowClassName,
  actions = { canEdit: true, canDelete: true },
  idField,
  entityName,
  renderEditForm,
  fetchForEdit,
  formFields,
  prepareDataForSubmit,
  modalClassName,
  expandableConfig
}: Readonly<GenericTableProps<T>>) {
  const {
    data,
    loading,
    error,
    retry,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    goToPage,
    setItemsPerPage,
    updateItem,
    removeItem,
    handleDelete: serviceDelete,
    handleUpdate: serviceUpdate,
  } = useGenericPageContext<T>()

  const actionsWithDefaults = actions || { canEdit: true, canDelete: true }
  const isDesktop = useMediaQuery('(min-width: 1024px)')
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
    loadingEditId,
    handleDelete,
    handleEdit,
    handleEditSuccess,
    closeEditModal
  } = useTableActions<T>(
    entityName,
    serviceDelete,
    updateItem,
    removeItem,
    fetchForEdit,
    idField,
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

  const sharedBodyProps = {
    data,
    columns,
    showActions,
    actions: actionsWithDefaults as GenericActions<T>,
    onEdit: handleEdit,
    onDelete: (item: T) => handleDelete(item, idField),
    onDropdownToggle: handleDropdownToggle,
    rowClassName,
    expandableConfig,
    expandedRows,
    toggleRowExpansion,
    idField,
    deletingItemId,
    loadingEditId,
  }

  return (
    <>
      <div className='overflow-hidden rounded-lg border border-(--color-border) bg-(--color-bg-surface) shadow-xs'>
        {isDesktop ? (
          /* Tabla: tablet landscape y desktop (≥ lg = 1024px) */
          <div className='max-h-[70vh] overflow-x-auto overflow-y-auto'>
            <table className='w-full min-w-180 divide-y divide-(--color-border)'>
              <GenericTableHeader
                columns={columns}
                showActions={showActions}
                hasExpandable={!!expandableConfig}
              />
              <GenericTableBody {...sharedBodyProps} />
            </table>
          </div>
        ) : (
          /* Cards: móvil y tablet portrait (< lg = 1024px) */
          <div className='p-3'>
            <GenericTableCards {...sharedBodyProps} />
          </div>
        )}

        {/* Paginación compartida por ambas vistas */}
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
        onUpdate={serviceUpdate}
        prepareDataForSubmit={prepareDataForSubmit}
        className={modalClassName}
        onEditSuccess={(updatedItem) => handleEditSuccess(updatedItem, idField)}
        onClose={closeEditModal}
      />

    </>
  )
}
