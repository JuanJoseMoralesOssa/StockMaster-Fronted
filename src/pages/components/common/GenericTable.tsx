import React, { useState } from 'react'

interface GenericTableProps<T> {
  items: T[]
  loading: boolean
  error: string | null
  headers: string[]
  keyFn: (item: T) => string | number
  renderMainRow: (item: T, isExpanded: boolean, toggleExpand: (id?: string | number | undefined) => void) => JSX.Element
  renderDetailsRow?: (item: T) => JSX.Element | null
  onRetry?: () => void
}

export default function GenericTable<T>({
  items,
  loading,
  error,
  headers,
  keyFn,
  renderMainRow,
  renderDetailsRow,
  onRetry
}: GenericTableProps<T>) {
  const [expanded, setExpanded] = useState<(string | number)[]>([])

  const toggleExpand = (id?: string | number | undefined) => {
    if (id === undefined || id === null) return
    setExpanded(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }

  if (loading) {
    return <div className='p-4 text-center'>Cargando...</div>
  }

  if (error) {
    return (
      <div className='p-4 bg-red-50 border border-red-200 rounded-md text-red-600'>
        <p className='font-medium'>Error al cargar datos:</p>
        <p>{error}</p>
        {onRetry && (
          <button className='mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded-md text-sm' onClick={onRetry}>
            Reintentar
          </button>
        )}
      </div>
    )
  }

  return (
    <section className='py-4 overflow-x-auto sm:overflow-visible'>
      <table className='w-full border border-gray-50 rounded-xl table-auto text-sm sm:text-base'>
        <thead>
          <tr className='bg-gray-50 text-left text-gray-600 uppercase text-xs sm:text-sm'>
            {headers.map((header) => (
              <th key={'GenericHeader' + header} className='p-2'>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className='bg-white divide-y divide-gray-200'>
          {items.map((item) => (
            <React.Fragment key={keyFn(item)}>
              {renderMainRow(item, Array.isArray(expanded) && expanded.includes((keyFn(item) as string | number)), toggleExpand)}
              {renderDetailsRow && (Array.isArray(expanded) && expanded.includes((keyFn(item) as string | number))) && renderDetailsRow(item)}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </section>
  )
}
