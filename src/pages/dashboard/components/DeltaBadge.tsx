interface DeltaBadgeProps {
  delta: number | null
  /** When false the badge is hidden regardless of delta value */
  show?: boolean
}

/** Small tag showing `↑ X% vs periodo anterior` or `↓ X% vs periodo anterior`. */
function DeltaBadge({ delta, show = true }: Readonly<DeltaBadgeProps>) {
  if (delta === null || !show) return null
  const positive = delta >= 0
  return (
    <div className={`text-xs font-semibold flex items-center gap-0.5 mt-2 ${positive ? 'text-success-700' : 'text-danger-700'}`}>
      <span>{positive ? '↑' : '↓'}</span>
      <span>{Math.abs(delta).toFixed(1)}% vs periodo anterior</span>
    </div>
  )
}

export default DeltaBadge
