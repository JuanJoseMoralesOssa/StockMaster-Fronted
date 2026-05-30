import { LineChart, LayoutDashboard } from "lucide-react"

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
    <div className="flex bg-(--color-bg-subtle) rounded-lg p-1 w-fit mt-1 mb-1">
      <button
        onClick={() => handleModeChange('detailed')}
        className={`px-4.5 py-2 rounded-md text-[13.5px] font-semibold transition-all flex items-center gap-1.75 ${dashboardMode === 'detailed'
          ? 'bg-(--color-bg-surface) text-(--view-accent-text,var(--color-text-link)) shadow-sm'
          : 'text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-bg-muted)'
          }`}
      >
<LineChart className="w-4 h-4" /> Vista Detallada (Meses)
      </button>
      <button
        onClick={() => handleModeChange('general')}
        className={`px-4.5 py-2 rounded-md text-[13.5px] font-semibold transition-all flex items-center gap-1.75 ${dashboardMode === 'general'
          ? 'bg-(--color-bg-surface) text-(--view-accent-text,var(--color-text-link)) shadow-sm'
          : 'text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-bg-muted)'
          }`}
      >
<LayoutDashboard className="w-4 h-4" /> Vista General (Resumen)
      </button>
    </div>
  )
}

export default ModeToggleDashboard
