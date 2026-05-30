import { RefreshCw } from "lucide-react"

interface RefreshButtonProps {
  onRefresh: () => void
  loading: boolean
}

function RefreshButton({ onRefresh, loading }: RefreshButtonProps) {
  return (
    <button
      onClick={onRefresh}
      disabled={loading}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
        transition-all duration-200 transform hover:scale-105
        ${loading
          ? 'bg-(--color-bg-muted) text-(--color-text-muted) cursor-not-allowed'
          : 'bg-(--color-action-bg) text-(--color-action-text) hover:bg-(--color-action-bg-hover) active:scale-95'
        }
      `}
      title={loading ? 'Actualizando...' : 'Actualizar datos'}
    >
      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Actualizando...' : 'Actualizar'}
    </button>
  )
}

export default RefreshButton
