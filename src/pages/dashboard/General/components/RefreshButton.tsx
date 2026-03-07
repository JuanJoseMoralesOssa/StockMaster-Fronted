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
          ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
          : 'bg-primary text-white hover:bg-primary-hover active:scale-95'
        }
      `}
      title={loading ? 'Actualizando...' : 'Actualizar datos'}
    >
      <span className={`text-lg ${loading ? 'animate-spin' : ''}`}>
        🔄
      </span>
      {loading ? 'Actualizando...' : 'Actualizar'}
    </button>
  )
}

export default RefreshButton
