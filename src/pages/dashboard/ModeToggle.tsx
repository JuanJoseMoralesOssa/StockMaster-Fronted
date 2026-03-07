interface ModeToggleDashboardProps {
  dashboardMode: 'detailed' | 'general'
  handleModeChange: (mode: 'detailed' | 'general') => void
}

function ModeToggleDashboard(
  {
    dashboardMode,
    handleModeChange,
  }: Readonly<ModeToggleDashboardProps>
) {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1 w-fit mt-1 mb-1">
      <button
        onClick={() => handleModeChange('detailed')}
        className={`px-4.5 py-2 rounded-md text-[13.5px] font-semibold transition-all flex items-center gap-1.75 ${dashboardMode === 'detailed'
          ? 'bg-white text-blue-600 shadow-sm'
          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
          }`}
      >
        📊 Vista Detallada (Meses)
      </button>
      <button
        onClick={() => handleModeChange('general')}
        className={`px-4.5 py-2 rounded-md text-[13.5px] font-semibold transition-all flex items-center gap-1.75 ${dashboardMode === 'general'
          ? 'bg-white text-blue-600 shadow-sm'
          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
          }`}
      >
        📝 Vista General (Resumen)
      </button>
    </div>
  )
}

export default ModeToggleDashboard
