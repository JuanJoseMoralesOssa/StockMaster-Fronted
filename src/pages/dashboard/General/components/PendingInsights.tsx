import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, Building2, Clock, CheckCircle2 } from 'lucide-react'
import { useDashboardInsights } from '@/hooks/useDashboardInsights'
import { formatKg } from '@/utils/format'
import { todayBogota } from '@/utils/date'
import { Skeleton } from '@/components/ui'
import type { PendingTrendInterval } from '@/types/Analytics'

interface PendingInsightsProps {
  startDate: string
  endDate: string
}

const PENDING_COLOR = '#f59e0b'

/** Días entre `iso` (YYYY-MM-DD) y hoy (Bogotá). null si no hay fecha. */
function daysSince(iso: string | null): number | null {
  if (!iso) return null
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  const [ty, tm, td] = todayBogota().slice(0, 10).split('-').map(Number)
  if (!y || !ty) return null
  const diff = (Date.UTC(ty, tm - 1, td) - Date.UTC(y, m - 1, d)) / 86400000
  return Math.max(0, Math.round(diff))
}

/** Tono por antigüedad del pendiente (más viejo = más riesgo de merma). */
function ageTone(days: number | null): string {
  if (days == null) return 'text-(--color-text-muted)'
  if (days > 30) return 'text-danger-700'
  if (days > 7) return 'text-warning-700'
  return 'text-(--color-text-secondary)'
}

/** Etiqueta accesible del riesgo por antigüedad (no depende solo del color). */
function ageLabel(days: number | null): string | undefined {
  if (days == null) return undefined
  const risk = days > 30 ? 'riesgo alto' : days > 7 ? 'riesgo medio' : 'reciente'
  return `pendiente hace ${days} días, ${risk}`
}

function formatPeriod(period: string, interval: PendingTrendInterval): string {
  const [y, m, d] = period.split('-')
  if (interval === 'month') {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const name = months[Number(m) - 1]
    return name ? `${name} ${y.slice(2)}` : period
  }
  // El bucket semanal es el lunes de la semana: lo prefijamos para que no se
  // confunda con un tick diario.
  if (interval === 'week') {
    return `Sem ${d}/${m}`
  }
  return `${d}/${m}`
}

const cardClass =
  'bg-(--color-bg-surface) p-4 rounded-lg border border-(--color-border) shadow-xs'

export default function PendingInsights({ startDate, endDate }: Readonly<PendingInsightsProps>) {
  const { trend, bySupplier, byProduct, interval, loading, error } = useDashboardInsights(
    startDate,
    endDate,
  )

  const trendData = useMemo(
    () => trend.map((p) => ({ ...p, label: formatPeriod(p.period, interval) })),
    [trend, interval],
  )

  if (loading && trend.length === 0 && bySupplier.length === 0 && byProduct.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${cardClass} text-sm text-danger-700`}>
        No se pudieron cargar los insights de pendiente: {error}
      </div>
    )
  }

  const noPending = bySupplier.length === 0 && byProduct.length === 0
  const hasTrend = trendData.some((p) => p.pending !== 0 || p.purchased !== 0 || p.paid !== 0)
  const latestPending = trendData.length > 0 ? trendData[trendData.length - 1].pending : 0
  // El AreaChart solo comunica visualmente; damos una alternativa textual a lectores
  // de pantalla con el último valor del pendiente.
  const trendAriaLabel = `Tendencia del saldo pendiente (compras menos pagos) en el tiempo. Último período: ${formatKg(latestPending)} kg.`

  return (
    <div className="space-y-4">
      {/* Tendencia del pendiente */}
      <div className={cardClass}>
        <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-(--color-text-primary)">
          <TrendingUp className="h-4 w-4 text-(--view-accent-text,var(--color-text-link))" />
          Tendencia del pendiente
          <span className="text-xs font-normal text-(--color-text-secondary)">
            (saldo acumulado: compras − pagos)
          </span>
        </h3>
        {hasTrend ? (
          <div role="img" aria-label={trendAriaLabel}>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trendData} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
              <defs>
                <linearGradient id="pendingFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={PENDING_COLOR} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={PENDING_COLOR} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" fontSize={11} />
              <YAxis fontSize={11} width={48} tickFormatter={(v) => formatKg(Number(v))} />
              <Tooltip
                formatter={(value, name) => [
                  `${formatKg(Number(value))} kg`,
                  name === 'pending' ? 'Pendiente' : name === 'purchased' ? 'Compras' : 'Pagos',
                ]}
              />
              <Area
                type="monotone"
                dataKey="pending"
                name="pending"
                stroke={PENDING_COLOR}
                strokeWidth={2}
                fill="url(#pendingFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-(--color-text-secondary)">
            Sin movimientos de pendiente en este período.
          </p>
        )}
      </div>

      {noPending ? (
        <div className={`${cardClass} flex items-center justify-center gap-2 py-6 text-success-700`}>
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-sm font-medium">Todo al día: no hay pendientes por entregar/pagar.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Pendiente por proveedor */}
          <div className={cardClass}>
            <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-(--color-text-primary)">
              <Building2 className="h-4 w-4 text-(--view-accent-text,var(--color-text-link))" />
              Pendiente por proveedor
            </h3>
            {bySupplier.length === 0 ? (
              <p className="py-4 text-center text-sm text-(--color-text-secondary)">Sin pendiente.</p>
            ) : (
              <ul className="space-y-2">
                {bySupplier.map((s) => (
                  <li key={s.personId} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate font-medium text-(--color-text-primary)">{s.personName}</span>
                    <div className="shrink-0 text-right tabular-nums">
                      <span className="font-semibold text-warning-700">{formatKg(s.pending)} kg</span>
                      <span
                        className="ml-1 text-xs text-(--color-text-secondary)"
                        aria-label={`comprado ${formatKg(s.purchased)} kg, pagado ${formatKg(s.paid)} kg`}
                      >
                        <span aria-hidden="true">(↑{formatKg(s.purchased)} ↓{formatKg(s.paid)})</span>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Pendiente por producto + antigüedad */}
          <div className={cardClass}>
            <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-(--color-text-primary)">
              <Clock className="h-4 w-4 text-(--view-accent-text,var(--color-text-link))" />
              Pendiente por producto
              <span className="text-xs font-normal text-(--color-text-secondary)">(y antigüedad)</span>
            </h3>
            {byProduct.length === 0 ? (
              <p className="py-4 text-center text-sm text-(--color-text-secondary)">Sin pendiente.</p>
            ) : (
              <ul className="space-y-2">
                {byProduct.map((p) => {
                  const days = daysSince(p.pendingSince)
                  return (
                    <li key={p.productId} className="flex items-center justify-between gap-3 text-sm">
                      <span className="min-w-0 truncate font-medium text-(--color-text-primary)">{p.productName}</span>
                      <div className="shrink-0 text-right tabular-nums">
                        <span className="font-semibold text-warning-700">{formatKg(p.balance)} kg</span>
                        <span className={`ml-1 text-xs ${ageTone(days)}`} aria-label={ageLabel(days)}>
                          {days == null ? '—' : `${days} d`}
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
