import { GenericColumn } from "../../../../types/GenericConfig"

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: GenericColumn<any>[]
  showActions: boolean
  hasExpandable?: boolean
}

export default function GenericTableHeader({ columns, showActions, hasExpandable }: Props) {
  return (
    <thead className='bg-gray-50 border-b border-gray-200'>
      <tr>
        {hasExpandable && (
          <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide w-12'>
            <span className='sr-only'>Ver detalles</span>
          </th>
        )}
        {columns.map((column, index) => (
          <th
            key={index}
            className={`px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide ${column.hideOnMobile ? 'hidden md:table-cell' : ''
              } ${column.width || ''}`}
          >
            {column.label}
          </th>
        ))}
        {showActions && (
          <th className='px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide'>
            Acciones
          </th>
        )}
      </tr>
    </thead>
  )
}
