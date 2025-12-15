import React, { Fragment } from 'react'
import PrimaryButton from '../../../components/common/PrimaryButton'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { GenericColumn, GenericActions } from '../../../../types/GenericConfig'
import { getCellValue } from './genericTableUtils'

interface Props<T> {
  data: T[]
  columns: GenericColumn<T>[]
  showActions: boolean
  actions: GenericActions<T>
  onEdit: (item: T) => void
  onDelete: (item: T) => void
  onDropdownToggle: (rowIndex: number, event: React.MouseEvent<HTMLButtonElement>) => void
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
  expandableConfig,
  expandedRows,
  toggleRowExpansion,
  idField
}: Props<T>) {
  const hasExpandable = !!expandableConfig && !!expandedRows && !!toggleRowExpansion
  const totalColumns = columns.length + (showActions ? 1 : 0) + (hasExpandable ? 1 : 0)

  return (
    <tbody className='bg-white divide-y divide-gray-200'>
      {data.length === 0 ? (
        <tr>
          <td colSpan={totalColumns} className='px-6 py-8 text-center text-gray-500'>
            No hay datos disponibles
          </td>
        </tr>
      ) : (
        data.map((item, rowIndex) => {
          const itemId = item[idField] as string | number
          const isExpanded = hasExpandable && expandedRows.has(itemId)

          return (
            <Fragment key={rowIndex}>
              <tr className='hover:bg-gray-50 transition-colors duration-150'>
                {/* Columna de expansión */}
                {hasExpandable && (
                  <td className='px-4 py-4 whitespace-nowrap w-12'>
                    <button
                      onClick={() => toggleRowExpansion(itemId)}
                      className="text-gray-400 hover:text-gray-600 transition-colors w-5 h-5 flex items-center justify-center"
                      title="Ver detalles"
                    >
                      {isExpanded ? '▼' : '▶'}
                    </button>
                  </td>
                )}

                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${column.hideOnMobile ? 'hidden md:table-cell' : ''
                      }`}
                  >
                    {getCellValue(item, column)}
                  </td>
                ))}

                {showActions && (
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-center'>
                    <div className='inline-flex items-center justify-center gap-1'>
                      {actions.canEdit && (
                        <PrimaryButton
                          onClick={() => onEdit(item)}
                          icon={<Pencil className='h-4 w-4' />}
                          title='Editar'
                          className='inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-gray-700 hover:bg-gray-100 transition-colors bg-transparent border-0'
                        >
                          <span className='hidden lg:inline text-sm'>Editar</span>
                        </PrimaryButton>
                      )}

                      {actions.canDelete && (
                        <PrimaryButton
                          onClick={() => onDelete(item)}
                          icon={<Trash2 className='h-4 w-4' />}
                          title='Eliminar'
                          className='inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-red-600 hover:bg-red-50 transition-colors bg-transparent border-0'
                        >
                          <span className='hidden lg:inline text-sm'>Eliminar</span>
                        </PrimaryButton>
                      )}

                      {actions.customActions && actions.customActions.length > 0 && (
                        <div className='relative'>
                          <PrimaryButton
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => onDropdownToggle(rowIndex, e)}
                            icon={<MoreVertical className='h-4 w-4' />}
                            title='Más opciones'
                            className='inline-flex items-center justify-center rounded-md p-1.5 text-gray-500 hover:bg-gray-100 transition-colors bg-transparent border-0'
                          />
                        </div>
                      )}
                    </div>
                  </td>
                )}
              </tr>

              {/* Fila expandida */}
              {hasExpandable && isExpanded && (
                <tr>
                  <td colSpan={totalColumns} className="px-0 py-0">
                    <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
                      {expandableConfig.expandedTitle && (
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          {expandableConfig.expandedTitle(item)}
                        </h4>
                      )}
                      {expandableConfig.renderExpandedContent(item)}
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
