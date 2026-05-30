import { Search, X } from 'lucide-react'
import { Button } from '../../../components/ui'

interface ActionButtonsProps {
  onSearch: () => void
  onClear: () => void
  loading?: boolean
}

function ActionButtons({ onSearch, onClear, loading = false }: Readonly<ActionButtonsProps>) {
  return (
    <div className="flex flex-wrap gap-3 mt-2 md:mt-0">
      <Button
        onClick={onSearch}
        size="sm"
        loading={loading}
        leftIcon={<Search className="h-4 w-4" />}
      >
        Buscar
      </Button>
      <Button
        onClick={onClear}
        variant="secondary"
        size="sm"
        disabled={loading}
        leftIcon={<X className="h-4 w-4" />}
      >
        Limpiar Filtros
      </Button>
    </div>
  )
}

export default ActionButtons
