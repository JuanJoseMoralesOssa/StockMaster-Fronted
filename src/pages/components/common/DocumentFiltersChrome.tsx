import { ReactNode } from 'react'
import { Button } from '../../../components/ui'
import { Search, X } from 'lucide-react'

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
  searchLabel = 'Buscar',
  clearLabel = 'Limpiar',
}: Readonly<DocumentFiltersChromeProps>) {
  return (
    <div className='flex flex-col gap-4'>
      <div className='w-full'>
        {children}
      </div>

      <div className='flex flex-col sm:flex-row gap-2 w-full sm:justify-end'>
        <Button
          variant='primary'
          onClick={onSearch}
          className='w-full sm:w-fit'
          aria-label={searchLabel}
          leftIcon={<Search className='h-4 w-4' />}
        >
          {searchLabel}
        </Button>

        <Button
          variant='secondary'
          onClick={onClear}
          className='w-full sm:w-fit'
          aria-label={clearLabel}
          leftIcon={<X className='h-4 w-4' />}
        >
          {clearLabel}
        </Button>
      </div>
    </div>
  )
}
