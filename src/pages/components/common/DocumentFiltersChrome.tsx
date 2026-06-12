import { ReactNode } from 'react'
import { Button } from '../../../components/ui'
import { Search, X } from 'lucide-react'

interface DocumentFiltersChromeProps {
  children: ReactNode
  onSearch: () => void
  onClear: () => void
  loading?: boolean
  searchLabel?: string
  clearLabel?: string
}

export default function DocumentFiltersChrome({
  children,
  onSearch,
  onClear,
  loading = false,
  searchLabel = 'Buscar',
  clearLabel = 'Limpiar',
}: Readonly<DocumentFiltersChromeProps>) {
  return (
    <form
      className='flex flex-col gap-4'
      onSubmit={(event) => {
        event.preventDefault()
        onSearch()
      }}
    >
      <div className='w-full'>
        {children}
      </div>

      <div className='flex flex-col sm:flex-row gap-2 w-full sm:justify-end'>
        <Button
          type='submit'
          variant='secondary'
          className='w-full sm:w-fit'
          aria-label={searchLabel}
          loading={loading}
          leftIcon={<Search className='h-4 w-4' />}
        >
          {searchLabel}
        </Button>

        <Button
          type='button'
          variant='secondary'
          onClick={onClear}
          className='w-full sm:w-fit'
          aria-label={clearLabel}
          disabled={loading}
          leftIcon={<X className='h-4 w-4' />}
        >
          {clearLabel}
        </Button>
      </div>
    </form>
  )
}
