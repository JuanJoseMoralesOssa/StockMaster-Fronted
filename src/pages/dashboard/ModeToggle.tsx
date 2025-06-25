interface ModeToggleDashboardProps {
  dashboardMode: 'detailed' | 'general';
  handleModeChange: (mode: 'detailed' | 'general') => void;
}

function ModeToggleDashboard(
  {
    dashboardMode,
    handleModeChange,
  }: Readonly<ModeToggleDashboardProps>
) {
  return (
    <div className="mb-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-800 mb-3">Tipo de Vista</h3>
        <div className="flex gap-2">
          <button
            onClick={() => handleModeChange('detailed')}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${dashboardMode === 'detailed'
              ? 'bg-blue-600 text-white shadow-md transform scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            📊 Vista Detallada (Meses)
          </button>
          <button
            onClick={() => handleModeChange('general')}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${dashboardMode === 'general'
              ? 'bg-green-600 text-white shadow-md transform scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            📈 Vista General (Resumen)
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {dashboardMode === 'detailed'
            ? '🔍 Vista detallada con gráficas mensuales y opciones de exportación'
            : '⚡ Vista general con resúmenes rápidos sin exportación'
          }
        </p>
      </div>
    </div>

  )
}

export default ModeToggleDashboard
