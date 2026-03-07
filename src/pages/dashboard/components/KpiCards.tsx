import { BarChart3, TrendingUp, Users, Package } from 'lucide-react'
import DeltaBadge from './DeltaBadge'

interface SummaryData {
  totalWeight: number
  totalTransactions: number
  totalSuppliers: number
}

interface KpiCardsProps {
  current: SummaryData | undefined
  previous: SummaryData | undefined
}

/** Returns percentage change or null when previous is 0. */
const pct = (cur: number, prev: number): number | null =>
  prev === 0 ? null : ((cur - prev) / prev) * 100

function KpiCards({ current, previous }: Readonly<KpiCardsProps>) {
  const totalWeight = current?.totalWeight ?? 0
  const totalTransactions = current?.totalTransactions ?? 0
  const totalSuppliers = current?.totalSuppliers ?? 0
  const avgPerOrder = totalTransactions > 0 ? totalWeight / totalTransactions : 0

  const prevWeight = previous?.totalWeight ?? 0
  const prevTransactions = previous?.totalTransactions ?? 0
  const prevSuppliers = previous?.totalSuppliers ?? 0
  const prevAvg = prevTransactions > 0 ? prevWeight / prevTransactions : 0

  const hasPrev = !!previous

  const cards = [
    {
      label: 'Total Actividad',
      value: `${totalWeight.toLocaleString()} kg`,
      delta: pct(totalWeight, prevWeight),
      icon: <TrendingUp className="w-4 h-4" />,
      iconBg: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Proveedores',
      value: String(totalSuppliers),
      delta: pct(totalSuppliers, prevSuppliers),
      icon: <Users className="w-4 h-4" />,
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Órdenes',
      value: totalTransactions.toLocaleString(),
      delta: pct(totalTransactions, prevTransactions),
      icon: <BarChart3 className="w-4 h-4" />,
      iconBg: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Prom. por Orden',
      value: `${avgPerOrder.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg`,
      delta: pct(avgPerOrder, prevAvg),
      icon: <Package className="w-4 h-4" />,
      iconBg: 'bg-violet-50 text-violet-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white border border-gray-200 rounded-xl p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide">
              {card.label}
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.iconBg}`}>
              {card.icon}
            </div>
          </div>
          <div className="text-[22px] font-bold text-gray-900 tracking-tight font-mono">
            {card.value}
          </div>
          <DeltaBadge delta={card.delta} show={hasPrev} />
        </div>
      ))}
    </div>
  )
}

export default KpiCards
