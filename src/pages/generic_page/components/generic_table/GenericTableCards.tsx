import React, { Fragment } from 'react'
import { ChevronDown, ChevronRight, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { GenericColumn, GenericActions } from '../../../../types/GenericConfig'
import { getCellValue } from './genericTableUtils'
import { Button } from '../../../../components/ui'

interface Props<T> {
  data: T[]
  columns: GenericColumn<T>[]
  showActions: boolean
  actions: GenericActions<T>
  onEdit: (item: T) => void
  onDelete: (item: T) => void
  onDropdownToggle: (rowIndex: number, event: React.MouseEvent<HTMLButtonElement>) => void
  rowClassName?: (item: T) => string
  expandableConfig?: {
    renderExpandedContent: (item: T) => React.ReactNode
    expandedTitle?: (item: T) => string
  }
  expandedRows?: Set<string | number>
  toggleRowExpansion?: (id: string | number) => void
  idField: keyof T
  deletingItemId?: string | number | null
  loadingEditId?: string | number | null
}

export default function GenericTableCards<T>({
  data,
  columns,
  showActions,
  actions,
  onEdit,
  onDelete,
  onDropdownToggle,
  rowClassName,
  expandableConfig,
  expandedRows,
  toggleRowExpansion,
  idField,
  deletingItemId,
  loadingEditId,
}: Props<T>) {
  const hasExpandable = !!expandableConfig && !!expandedRows && !!toggleRowExpansion
  const visibleColumns = columns.filter((column) => !column.hideOnMobile)
  const [titleColumn, ...bodyColumns] = visibleColumns

  return (
    <ul className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
      {data.map((item, rowIndex) => {
        const itemId = item[idField] as string | number
        const isExpanded = hasExpandable && expandedRows.has(itemId)
        const isDeleting = deletingItemId === itemId
        const isLoadingEdit = loadingEditId === itemId

        return (
          <li
            key={itemId}
            className={`rounded-lg border border-(--color-border) bg-(--color-bg-surface) p-4 shadow-xs ${isExpanded ? 'sm:col-span-2' : ''} ${rowClassName ? rowClassName(item) : ''}`}
          >
            {/* Primera columna como título prominente */}
            {titleColumn && (
              <div className='mb-3 text-base font-semibold text-(--color-text-primary)'>
                {getCellValue(item, titleColumn)}
              </div>
            )}

            {/* Resto de columnas como pares label/valor */}
            {bodyColumns.length > 0 && (
              <dl className='grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm'>
                {bodyColumns.map((column, colIndex) => (
                  <Fragment key={colIndex}>
                    <dt className='font-medium text-(--color-text-secondary)'>{column.label}</dt>
                    <dd className={`text-(--color-text-primary) ${column.align === 'right' ? 'text-right' : 'text-left'}`}>
                      {getCellValue(item, column)}
                    </dd>
                  </Fragment>
                ))}
              </dl>
            )}

            {/* Fila expandible */}
            {hasExpandable && (
              <div className='mt-3 border-t border-(--color-border) pt-3'>
                <Button
                  variant='ghost'
                  size='md'
                  onClick={() => toggleRowExpansion(itemId)}
                  aria-expanded={isExpanded}
                  className='w-full justify-between'
                >
                  <span>{isExpanded ? 'Ocultar detalles' : 'Ver detalles'}</span>
                  {isExpanded
                    ? <ChevronDown className='h-4 w-4' aria-hidden='true' />
                    : <ChevronRight className='h-4 w-4' aria-hidden='true' />}
                </Button>

                {isExpanded && (
                  <div className='mt-3 rounded-md bg-(--view-accent-soft,var(--color-bg-subtle)) px-4 py-3'>
                    {expandableConfig.expandedTitle && (
                      <h4 className='mb-3 text-sm font-semibold text-(--color-text-primary)'>
                        {expandableConfig.expandedTitle(item)}
                      </h4>
                    )}
                    <div className='text-(--color-text-secondary)'>
                      {expandableConfig.renderExpandedContent(item)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Acciones */}
            {showActions && (
              <div className='mt-3 flex items-center justify-end gap-1 border-t border-(--color-border) pt-3'>
                {actions.canEdit && (
                  <Button
                    variant='ghost'
                    size='md'
                    onClick={() => onEdit(item)}
                    disabled={isDeleting}
                    loading={isLoadingEdit}
                    leftIcon={<Pencil className='h-4 w-4' aria-hidden='true' />}
                    className='action-icon-edit'
                  >
                    Editar
                  </Button>
                )}

                {actions.canDelete && (
                  <Button
                    variant='ghost'
                    size='md'
                    onClick={() => onDelete(item)}
                    loading={isDeleting}
                    leftIcon={<Trash2 className='h-4 w-4' aria-hidden='true' />}
                    className='action-icon-delete'
                  >
                    Eliminar
                  </Button>
                )}

                {actions.customActions && actions.customActions.length > 0 && (
                  <Button
                    variant='ghost'
                    size='icon-md'
                    onClick={(e) => onDropdownToggle(rowIndex, e)}
                    disabled={isDeleting}
                    aria-label='Más opciones'
                    title='Más opciones'
                    className='action-icon-more'
                  >
                    <MoreVertical className='h-4 w-4' aria-hidden='true' />
                  </Button>
                )}
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
