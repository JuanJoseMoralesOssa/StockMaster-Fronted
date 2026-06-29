import { Scale, CheckCircle2, Clock, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { InventorySummaryResponse } from '../../../types/Analytics'
import { Skeleton } from '../../../components/ui'
import { formatKg } from '../../../utils/format'

interface InventoryKpisProps {
  data: InventorySummaryResponse | null
  loading: boolean
}

const INVENTORY_GRID = 'grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6'

function InventoryKpisSkeleton() {
  return (
    <div className={INVENTORY_GRID}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="min-w-0 bg-(--color-bg-surface) border border-(--color-border) rounded-lg p-4 shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-3 w-28 mt-1" />
        </div>
      ))}
    </div>
  )
}

/**
 * Snapshot del pendiente (modelo de flujo, NO retail): el `balance` es lo
 * comprado que aún no se entrega/paga, así que un balance BAJO es bueno.
 * "Al día" = productos sin pendiente; "Con pendiente" = los que falta mover.
 * Independiente de los filtros de fecha del dashboard.
 */
function InventoryKpis({ data, loading }: Readonly<InventoryKpisProps>) {
  if (loading && !data) return <InventoryKpisSkeleton />
  if (!data) return null

  const cards = [
    {
      label: 'Balance pendiente',
      value: `${formatKg(data.totalBalance)} kg`,
      hint: `${data.inBalanceCount} de ${data.productCount} con pendiente`,
      icon: <Scale className="w-4 h-4" />,
      tone: 'neutral' as const,
    },
    {
      label: 'Al día',
      value: String(data.outOfBalanceCount),
      hint: 'productos sin pendiente',
      icon: <CheckCircle2 className="w-4 h-4" />,
      tone: 'good' as const,
    },
    {
      label: 'Con pendiente',
      value: String(data.inBalanceCount),
      hint: 'por entregar / pagar',
      icon: <Clock className="w-4 h-4" />,
      tone: data.inBalanceCount > 0 ? ('warn' as const) : ('good' as const),
      link: data.inBalanceCount > 0 ? '/productos' : undefined,
    },
  ]

  const toneText: Record<'neutral' | 'good' | 'warn', string> = {
    neutral: 'text-(--color-text-primary)',
    good: 'text-success-700',
    warn: 'text-warning-700',
  }

  return (
    <div className={INVENTORY_GRID}>
      {cards.map((card) => (
        <div
          key={card.label}
          className="min-w-0 bg-(--color-bg-surface) border border-(--color-border) rounded-lg p-4 shadow-xs transition-colors lg:hover:border-(--color-border-strong)"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-(--color-text-secondary) uppercase tracking-wide">
              {card.label}
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-(--color-bg-subtle) text-(--color-text-link)">
              {card.icon}
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-bold tracking-tight font-mono tabular-nums ${toneText[card.tone]}`}>
            {card.value}
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-(--color-text-secondary)">{card.hint}</span>
            {'link' in card && card.link && (
              <Link
                to={card.link}
                className="flex items-center gap-0.5 text-xs text-(--color-text-link) hover:underline font-medium"
              >
                Ver <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default InventoryKpis
