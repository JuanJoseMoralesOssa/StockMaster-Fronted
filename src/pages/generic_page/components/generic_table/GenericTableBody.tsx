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
  idField
}: Props<T>) {
  const hasExpandable = !!expandableConfig && !!expandedRows && !!toggleRowExpansion
  const totalColumns = columns.length + (showActions ? 1 : 0) + (hasExpandable ? 1 : 0)

  return (
    <tbody className='divide-y divide-gray-200'>
      {data.length === 0 ? (
        <tr>
          <td colSpan={totalColumns} className='px-6 py-8 text-center text-gray-400'>
            No hay datos disponibles
          </td>
        </tr>
      ) : (
        data.map((item, rowIndex) => {
          const itemId = item[idField] as string | number
          const isExpanded = hasExpandable && expandedRows.has(itemId)

          return (
            <Fragment key={rowIndex}>
              <tr className={`bg-white hover:bg-gray-50 transition-colors ${rowClassName ? rowClassName(item) : ''}`}>
                {hasExpandable && (
                  <td className='px-4 py-3 whitespace-nowrap w-12'>
                    <Button
                      variant='ghost'
                      size='icon-sm'
                      onClick={() => toggleRowExpansion(itemId)}
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
                    className={`px-6 py-3 whitespace-nowrap text-sm text-gray-900 ${column.hideOnMobile ? 'hidden md:table-cell' : ''
                      }`}
                  >
                    {getCellValue(item, column)}
                  </td>
                ))}

                {showActions && (
                  <td className='px-6 py-3 whitespace-nowrap text-sm text-right'>
                    <div className='inline-flex items-center justify-end gap-1'>
                      {actions.canEdit && (
                        <Button
                          variant='ghost'
                          size='icon-sm'
                          onClick={() => onEdit(item)}
                          aria-label='Editar'
                          title='Editar'
                        >
                          <Pencil className='h-4 w-4' aria-hidden='true' />
                        </Button>
                      )}

                      {actions.canDelete && (
                        <Button
                          variant='ghost'
                          size='icon-sm'
                          onClick={() => onDelete(item)}
                          aria-label='Eliminar'
                          title='Eliminar'
                          className='text-danger-600 hover:bg-danger-50 hover:text-danger-700'
                        >
                          <Trash2 className='h-4 w-4' aria-hidden='true' />
                        </Button>
                      )}

                      {actions.customActions && actions.customActions.length > 0 && (
                        <Button
                          variant='ghost'
                          size='icon-sm'
                          onClick={(e) => onDropdownToggle(rowIndex, e)}
                          aria-label='Más opciones'
                          title='Más opciones'
                        >
                          <MoreVertical className='h-4 w-4' aria-hidden='true' />
                        </Button>
                      )}
                    </div>
                  </td>
                )}
              </tr>

              {hasExpandable && isExpanded && (
                <tr className='bg-gray-50 border-t border-gray-200'>
                  <td colSpan={totalColumns} className='px-0 py-0'>
                    <div className='px-6 py-4'>
                      {expandableConfig.expandedTitle && (
                        <h4 className='text-sm font-semibold text-gray-900 mb-4'>
                          {expandableConfig.expandedTitle(item)}
                        </h4>
                      )}
                      <div className='text-gray-700'>
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
