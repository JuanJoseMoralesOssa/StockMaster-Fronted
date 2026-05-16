interface DashboardHeaderProps {
  title: string
  subtitle: string
  dateFormatted: string
}

function DashboardHeader({ title, subtitle, dateFormatted }: Readonly<DashboardHeaderProps>) {
  return (
    <div className="flex flex-col md:flex-row md:items-start justify-between mb-7 gap-4">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-1 h-10 w-1 rounded-full bg-[var(--view-accent,var(--color-action-bg))]" aria-hidden="true" />
        <div>
          <h1 className="text-[24px] font-bold text-(--color-text-primary) tracking-tight">{title}</h1>
          <p className="text-[13.5px] text-(--color-text-secondary) mt-1">{subtitle}</p>
        </div>
      </div>
      <div className="text-[12.5px] text-(--color-text-secondary) bg-(--color-bg-surface) border border-[var(--view-accent-border,var(--color-border))] rounded-lg px-3 py-1.5 font-mono shadow-xs shrink-0">
        {dateFormatted}
      </div>
    </div>
  )
}

export default DashboardHeader
