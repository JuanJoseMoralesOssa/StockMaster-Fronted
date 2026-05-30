import { GenericColumn } from "../../../../types/GenericConfig"

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: GenericColumn<any>[]
  showActions: boolean
  hasExpandable?: boolean
}

export default function GenericTableHeader({ columns, showActions, hasExpandable }: Props) {
  return (
    <thead className='border-b border-(--color-border) bg-(--view-accent-soft,var(--color-bg-subtle))'>
      <tr>
        {hasExpandable && (
          <th className='w-12 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-(--color-text-secondary)'>
            <span className='sr-only'>Ver detalles</span>
          </th>
        )}
        {columns.map((column, index) => (
          <th
            key={index}
            className={`px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-(--color-text-secondary) ${column.align === 'right' ? 'text-right' : 'text-left'} ${column.hideOnMobile ? 'hidden md:table-cell' : ''} ${column.width || ''}`}
          >
            {column.label}
          </th>
        ))}
        {showActions && (
          <th className='px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-(--color-text-secondary)'>
            Acciones
          </th>
        )}
      </tr>
    </thead>
  )
}
