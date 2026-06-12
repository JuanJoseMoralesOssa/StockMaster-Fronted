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
  const buttonBase =
    'flex flex-1 sm:flex-none items-center justify-center gap-1.75 rounded-md px-4.5 py-2 [@media(pointer:coarse)]:py-2.5 text-sm font-semibold transition-all'
  const buttonState = (active: boolean) =>
    active
      ? 'bg-(--color-bg-surface) text-(--view-accent-text,var(--color-text-link)) shadow-sm'
      : 'text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-bg-muted)'

  return (
    <div className="flex w-full sm:w-fit bg-(--color-bg-subtle) rounded-lg p-1 mt-1 mb-1">
      <button
        type="button"
        onClick={() => handleModeChange('detailed')}
        aria-pressed={dashboardMode === 'detailed'}
        className={`${buttonBase} ${buttonState(dashboardMode === 'detailed')}`}
      >
        <LineChart className="w-4 h-4 shrink-0" />
        <span>Vista Detallada <span className="hidden sm:inline">(Meses)</span></span>
      </button>
      <button
        type="button"
        onClick={() => handleModeChange('general')}
        aria-pressed={dashboardMode === 'general'}
        className={`${buttonBase} ${buttonState(dashboardMode === 'general')}`}
      >
        <LayoutDashboard className="w-4 h-4 shrink-0" />
        <span>Vista General <span className="hidden sm:inline">(Resumen)</span></span>
      </button>
    </div>
  )
}

export default ModeToggleDashboard
