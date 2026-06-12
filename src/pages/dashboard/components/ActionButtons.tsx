import { Search, X } from 'lucide-react'
import { Button } from '../../../components/ui'

interface ActionButtonsProps {
  onSearch: () => void
  onClear: () => void
  loading?: boolean
}

function ActionButtons({ onSearch, onClear, loading = false }: Readonly<ActionButtonsProps>) {
  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 mt-2 md:mt-0">
      <Button
        onClick={onSearch}
        size="md"
        loading={loading}
        leftIcon={<Search className="h-4 w-4" />}
        className="w-full sm:w-auto"
      >
        Buscar
      </Button>
      <Button
        onClick={onClear}
        variant="secondary"
        size="md"
        disabled={loading}
        leftIcon={<X className="h-4 w-4" />}
        className="w-full sm:w-auto"
      >
        Limpiar Filtros
      </Button>
    </div>
  )
}

export default ActionButtons
