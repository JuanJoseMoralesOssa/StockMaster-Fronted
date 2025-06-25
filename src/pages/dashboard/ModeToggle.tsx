interface ModeToggleDashboardProps {
  dashboardMode: 'detailed' | 'general';
  handleModeChange: (mode: 'detailed' | 'general') => void;
}

function ViewText(
  {
    dashboardMode,
  }: Readonly<Pick<ModeToggleDashboardProps, 'dashboardMode'>>
) {
  return <section>
    <p className="text-sm text-gray-600 mt-2">
      {
        dashboardMode === 'detailed'
          ? '🔍 Vista detallada con gráficas mensuales y opciones de exportación'
          : '⚡ Vista general con resúmenes rápidos sin exportación'
      }
    </p >
    <p className="text-xs text-gray-500 mt-2">
      Cambia entre vistas para ajustar la información mostrada según tus necesidades.
    </p>
  </section>
}

function ModeToggleDashboard(
  {
    dashboardMode,
    handleModeChange,
  }: Readonly<ModeToggleDashboardProps>
) {
  return (
    <div className="mb-6">
      <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center">
        <div className="text-center mb-4 md:flex md:items-center md:justify-between w-full">
          <div>
            <h3 className="text-md font-medium text-gray-800 mb-3">Tipo de Vista</h3>
            <div className="hidden md:block mx-1">
              <ViewText dashboardMode={dashboardMode} />
            </div>
          </div>
          <div className="flex gap-4 justify-center items-center mt-4 md:mt-0">
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
        </div>
        <div className="block md:hidden w-full">
          <ViewText dashboardMode={dashboardMode} />
        </div>
      </div>
    </div>
  )
}

export default ModeToggleDashboard
