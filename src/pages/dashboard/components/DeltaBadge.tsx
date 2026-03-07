interface DeltaBadgeProps {
  delta: number | null
  /** When false the badge is hidden regardless of delta value */
  show?: boolean
}

/** Small tag showing `↑ X% vs mes anterior` or `↓ X% vs mes anterior`. */
function DeltaBadge({ delta, show = true }: Readonly<DeltaBadgeProps>) {
  if (delta === null || !show) return null
  const positive = delta >= 0
  return (
    <div className={`text-[11.5px] font-semibold flex items-center gap-0.5 mt-2 ${positive ? 'text-emerald-600' : 'text-red-500'}`}>
      <span>{positive ? '↑' : '↓'}</span>
      <span>{Math.abs(delta).toFixed(1)}% vs mes anterior</span>
    </div>
  )
}

export default DeltaBadge
