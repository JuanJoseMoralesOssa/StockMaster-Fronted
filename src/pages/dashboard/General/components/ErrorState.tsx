interface ErrorStateProps {
  error: string
  onRetry: () => void
}

function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h3 className="text-red-800 font-semibold mb-2 text-lg">Error al cargar el análisis</h3>
          <p className="text-red-600 mb-6 max-w-md mx-auto">{error}</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={onRetry}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              🔄 Reintentar
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              🔄 Recargar página
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ErrorState
