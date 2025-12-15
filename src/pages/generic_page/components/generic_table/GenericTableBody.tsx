import React from 'react'
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
}

export default function GenericTableBody<T>({
  data,
  columns,
  showActions,
  actions,
  onEdit,
  onDelete,
  onDropdownToggle
}: Props<T>) {
  return (
    <tbody className='bg-white divide-y divide-gray-200'>
      {data.length === 0 ? (
        <tr>
          <td colSpan={columns.length + (showActions ? 1 : 0)} className='px-6 py-8 text-center text-gray-500'>
            No hay datos disponibles
          </td>
        </tr>
      ) : (
        data.map((item, rowIndex) => (
          <tr key={rowIndex} className='hover:bg-gray-50 transition-colors duration-150'>
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
        ))
      )}
    </tbody>
  )
}
