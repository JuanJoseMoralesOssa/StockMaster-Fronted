import { ReactNode } from 'react'
import { Button } from '../../../components/ui'

interface DocumentFiltersChromeProps {
  children: ReactNode
  onSearch: () => void
  onClear: () => void
  searchLabel?: string
  clearLabel?: string
}

export default function DocumentFiltersChrome({
  children,
  onSearch,
  onClear,
  searchLabel = 'Buscar Detallado',
  clearLabel = 'Limpiar Filtros',
}: Readonly<DocumentFiltersChromeProps>) {
  return (
    <div className='bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-6 justify-between items-center'>
      {children}

      <div className='flex flex-col md:flex-row gap-2 w-full md:w-fit'>
        <Button
          variant='primary'
          onClick={onSearch}
          className='w-full md:w-fit'
          aria-label={searchLabel}
        >
          <span aria-hidden='true'>🔍 </span>
          {searchLabel}
        </Button>

        <Button
          variant='primary'
          onClick={onClear}
          className='w-full md:w-fit'
          aria-label={clearLabel}
        >
          <span aria-hidden='true'>🧹 </span>
          {clearLabel}
        </Button>
      </div>
    </div>
  )
}
