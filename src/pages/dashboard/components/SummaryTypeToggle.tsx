import type { SummaryType } from '../hooks/useDashboardData'

interface SummaryTypeToggleProps {
  value: SummaryType
  onChange: (type: SummaryType) => void
}

const OPTIONS: { value: SummaryType; label: string }[] = [
  { value: 'both', label: 'Ambos' },
  { value: 'purchases', label: 'Compras' },
  { value: 'payments', label: 'Pagos' },
]

/** Segmented control to scope the dashboard KPIs to Compras / Pagos / Ambos. */
function SummaryTypeToggle({ value, onChange }: Readonly<SummaryTypeToggleProps>) {
  const buttonBase =
    'flex-1 lg:flex-none rounded-md px-2.5 sm:px-3.5 py-1.5 [@media(pointer:coarse)]:py-2.5 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-(--color-focus-ring)'

  return (
    <div className="flex w-full lg:w-fit bg-(--color-bg-subtle) rounded-lg p-1 mt-1 mb-1">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={`${buttonBase} ${
            value === opt.value
              ? 'bg-(--color-bg-surface) text-(--view-accent-text,var(--color-text-link)) shadow-sm'
              : 'text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-bg-muted)'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export default SummaryTypeToggle
