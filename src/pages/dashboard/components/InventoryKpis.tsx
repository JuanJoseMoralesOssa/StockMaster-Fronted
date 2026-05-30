import { Boxes, PackageX, AlertTriangle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { InventorySummaryResponse } from '../../../types/Analytics'
import { Skeleton } from '../../../components/ui'

interface InventoryKpisProps {
  data: InventorySummaryResponse | null
  loading: boolean
}

const INVENTORY_GRID = 'grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'

function InventoryKpisSkeleton() {
  return (
    <div className={INVENTORY_GRID}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="bg-(--color-bg-surface) border border-(--color-border) rounded-lg p-4 shadow-xs"
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
 * Current inventory snapshot cards: total stock, low-stock and out-of-stock
 * counts. Independent of the dashboard date filters.
 */
function InventoryKpis({ data, loading }: Readonly<InventoryKpisProps>) {
  if (loading && !data) return <InventoryKpisSkeleton />
  if (!data) return null

  const cards = [
    {
      label: 'Stock Total',
      value: `${data.totalStock.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg`,
      hint: `${data.inStockCount} de ${data.productCount} productos con existencias`,
      icon: <Boxes className="w-4 h-4" />,
      tone: 'neutral' as const,
    },
    {
      label: 'Bajo Stock',
      value: String(data.lowStockCount),
      hint: data.lowStockThreshold > 0 ? `≤ ${data.lowStockThreshold} kg` : 'umbral no definido',
      icon: <AlertTriangle className="w-4 h-4" />,
      tone: data.lowStockCount > 0 ? ('warn' as const) : ('neutral' as const),
    },
    {
      label: 'Agotados',
      value: String(data.outOfStockCount),
      hint: 'sin existencias',
      icon: <PackageX className="w-4 h-4" />,
      tone: data.outOfStockCount > 0 ? ('danger' as const) : ('neutral' as const),
      link: data.outOfStockCount > 0 ? '/productos' : undefined,
    },
  ]

  const toneText: Record<'neutral' | 'warn' | 'danger', string> = {
    neutral: 'text-(--color-text-primary)',
    warn: 'text-(--color-warning-text,#b45309)',
    danger: 'text-(--color-danger-text,#dc2626)',
  }

  return (
    <div className={INVENTORY_GRID}>
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-(--color-bg-surface) border border-(--color-border) rounded-lg p-4 shadow-xs"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold text-(--color-text-secondary) uppercase tracking-wide">
              {card.label}
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-(--color-bg-subtle) text-(--color-text-link)">
              {card.icon}
            </div>
          </div>
          <div className={`text-[22px] font-bold tracking-tight font-mono ${toneText[card.tone]}`}>
            {card.value}
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[11px] text-(--color-text-secondary)">{card.hint}</span>
            {'link' in card && card.link && (
              <Link
                to={card.link}
                className="flex items-center gap-0.5 text-[11px] text-danger-600 hover:text-danger-700 font-medium"
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
