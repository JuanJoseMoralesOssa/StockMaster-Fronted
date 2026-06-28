import { BarChart3, TrendingUp, TrendingDown, Users, FileText, Scale } from 'lucide-react'
import DeltaBadge from './DeltaBadge'
import { Skeleton } from '../../../components/ui'
import { AnalyticsSummary } from '../../../types/Analytics'

interface KpiCardsProps {
  current: AnalyticsSummary | undefined
  previous: AnalyticsSummary | undefined
  loading?: boolean
}

const KPI_GRID = 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4'

function KpiCardsSkeleton() {
  return (
    <div className={`${KPI_GRID} mb-6`}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-(--color-bg-surface) border border-(--color-border) rounded-lg p-3 md:p-5 shadow-xs"
        >
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-3 w-16 mt-2" />
        </div>
      ))}
    </div>
  )
}

/** Returns percentage change or null when previous is 0. */
const pct = (cur: number, prev: number): number | null =>
  prev === 0 ? null : ((cur - prev) / prev) * 100

const kg = (n: number) => `${n.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg`

function KpiCards({ current, previous, loading = false }: Readonly<KpiCardsProps>) {
  if (loading && !current) return <KpiCardsSkeleton />

  const c = current
  const p = previous
  const purchaseWeight = c?.totalPurchaseWeight ?? 0
  const paymentWeight = c?.totalPaymentWeight ?? 0
  const balance = c?.pendingWeight ?? 0
  const suppliers = c?.totalSuppliers ?? 0
  const docs = (c?.purchaseCount ?? 0) + (c?.paymentCount ?? 0)
  const lines = c?.totalTransactions ?? 0

  const hasPrev = !!p
  const prevDocs = (p?.purchaseCount ?? 0) + (p?.paymentCount ?? 0)
  const allZero = !!c && purchaseWeight === 0 && paymentWeight === 0 && suppliers === 0 && docs === 0

  const cards: Array<{
    label: string
    value: string
    delta: number | null
    icon: React.ReactNode
    hint?: string
    valueClass?: string
  }> = [
    {
      label: 'Kg Comprados',
      value: kg(purchaseWeight),
      delta: pct(purchaseWeight, p?.totalPurchaseWeight ?? 0),
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      label: 'Kg en Pagos',
      value: kg(paymentWeight),
      delta: pct(paymentWeight, p?.totalPaymentWeight ?? 0),
      icon: <TrendingDown className="w-4 h-4" />,
    },
    {
      label: 'Balance',
      value: kg(balance),
      delta: pct(balance, p?.pendingWeight ?? 0),
      icon: <Scale className="w-4 h-4" />,
      hint: 'Compras − Pagos',
      valueClass: balance < 0 ? 'text-danger-700' : 'text-(--color-text-primary)',
    },
    {
      label: 'Proveedores',
      value: String(suppliers),
      delta: pct(suppliers, p?.totalSuppliers ?? 0),
      icon: <Users className="w-4 h-4" />,
    },
    {
      label: 'Documentos',
      value: docs.toLocaleString(),
      delta: pct(docs, prevDocs),
      icon: <FileText className="w-4 h-4" />,
      hint: `${c?.purchaseCount ?? 0} compras · ${c?.paymentCount ?? 0} pagos`,
    },
    {
      label: 'Líneas',
      value: lines.toLocaleString(),
      delta: pct(lines, p?.totalTransactions ?? 0),
      icon: <BarChart3 className="w-4 h-4" />,
    },
  ]

  return (
    <div className="mb-6">
    <div className={KPI_GRID}>
      {cards.map((card) => (
        <div
          key={card.label}
          className="min-w-0 bg-(--color-bg-surface) border border-(--color-border) rounded-lg p-3 md:p-5 shadow-xs hover:border-(--view-accent-border,var(--color-border-strong)) transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-(--color-text-secondary) uppercase tracking-wide">
              {card.label}
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-(--view-accent-soft,var(--color-bg-subtle)) text-(--view-accent-text,var(--color-text-link))">
              {card.icon}
            </div>
          </div>
          <div className={`text-lg sm:text-2xl font-bold tracking-tight font-mono tabular-nums wrap-break-word ${card.valueClass ?? 'text-(--color-text-primary)'}`}>
            {card.value}
          </div>
          {card.hint && (
            <div className="text-xs text-(--color-text-secondary) mt-1">{card.hint}</div>
          )}
          <DeltaBadge delta={card.delta} show={hasPrev} />
        </div>
      ))}
    </div>
    {allZero && (
      <p className="text-xs text-(--color-text-secondary) text-center mt-2">
        Sin actividad registrada en este período
      </p>
    )}
    </div>
  )
}

export default KpiCards
