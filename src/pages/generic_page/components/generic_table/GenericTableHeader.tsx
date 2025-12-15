import { GenericColumn } from "../../../../types/GenericConfig"

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: GenericColumn<any>[]
  showActions: boolean
  hasExpandable?: boolean
}

export default function GenericTableHeader({ columns, showActions, hasExpandable }: Props) {
  return (
    <thead className='bg-linear-to-r from-gray-50 to-gray-100'>
      <tr>
        {hasExpandable && (
          <th className='px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-12'>
            Ver Detalles
          </th>
        )}
        {columns.map((column, index) => (
          <th
            key={index}
            className={`px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider ${column.hideOnMobile ? 'hidden md:table-cell' : ''
              } ${column.width || ''}`}
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
  )
}
