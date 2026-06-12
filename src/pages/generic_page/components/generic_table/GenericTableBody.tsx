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

export default function GenericTableBody<T>({
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
  const totalColumns = columns.length + (showActions ? 1 : 0) + (hasExpandable ? 1 : 0)

  return (
    <tbody className='divide-y divide-(--color-border)'>
      {data.length === 0 ? (
        <tr>
          <td colSpan={totalColumns} className='px-6 py-8 text-center text-(--color-text-muted)'>
            No hay datos disponibles
          </td>
        </tr>
      ) : (
        data.map((item, rowIndex) => {
          const itemId = item[idField] as string | number
          const isExpanded = hasExpandable && expandedRows.has(itemId)
          const isDeleting = deletingItemId === itemId
          const isLoadingEdit = loadingEditId === itemId

          return (
            <Fragment key={itemId}>
              <tr
                className={`bg-(--color-bg-surface) transition-colors hover:bg-(--view-accent-soft,var(--color-bg-subtle)) ${hasExpandable ? 'cursor-pointer' : ''} ${rowClassName ? rowClassName(item) : ''}`}
                onClick={hasExpandable ? () => toggleRowExpansion(itemId) : undefined}
              >
                {hasExpandable && (
                  <td className='w-12 whitespace-nowrap px-4 py-3.5'>
                    <Button
                      variant='ghost'
                      size='icon-sm'
                      onClick={(event) => {
                        event.stopPropagation()
                        toggleRowExpansion(itemId)
                      }}
                      aria-label={isExpanded ? 'Ocultar detalles' : 'Ver detalles'}
                      aria-expanded={isExpanded}
                    >
                      {isExpanded
                        ? <ChevronDown className='h-4 w-4' aria-hidden='true' />
                        : <ChevronRight className='h-4 w-4' aria-hidden='true' />}
                    </Button>
                  </td>
                )}

                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={`whitespace-nowrap px-5 py-3.5 text-sm text-(--color-text-primary) ${column.align === 'right' ? 'text-right' : 'text-left'} ${column.hideOnMobile ? 'hidden md:table-cell' : ''}`}
                  >
                    {getCellValue(item, column)}
                  </td>
                ))}

                {showActions && (
                  <td
                    className='whitespace-nowrap px-5 py-3.5 text-right text-sm'
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className='inline-flex items-center justify-end gap-1'>
                      {actions.canEdit && (
                        <Button
                          variant='ghost'
                          size='icon-sm'
                          onClick={() => onEdit(item)}
                          disabled={isDeleting}
                          loading={isLoadingEdit}
                          aria-label='Editar'
                          title='Editar'
                          className='action-icon-edit'
                        >
                          <Pencil className='h-4 w-4' aria-hidden='true' />
                        </Button>
                      )}

                      {actions.canDelete && (
                        <Button
                          variant='ghost'
                          size='icon-sm'
                          onClick={() => onDelete(item)}
                          loading={isDeleting}
                          aria-label='Eliminar'
                          title='Eliminar'
                          className='action-icon-delete'
                        >
                          <Trash2 className='h-4 w-4' aria-hidden='true' />
                        </Button>
                      )}

                      {actions.customActions && actions.customActions.length > 0 && (
                        <Button
                          variant='ghost'
                          size='icon-sm'
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
                  </td>
                )}
              </tr>

              {hasExpandable && isExpanded && (
                <tr className='border-t border-(--view-accent-border,var(--color-border)) bg-(--view-accent-soft,var(--color-bg-subtle))'>
                  <td colSpan={totalColumns} className='px-0 py-0'>
                    <div className='px-5 py-4'>
                      {expandableConfig.expandedTitle && (
                        <h4 className='mb-4 text-sm font-semibold text-(--color-text-primary)'>
                          {expandableConfig.expandedTitle(item)}
                        </h4>
                      )}
                      <div className='text-(--color-text-secondary)'>
                        {expandableConfig.renderExpandedContent(item)}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          )
        })
      )}
    </tbody>
  )
}
