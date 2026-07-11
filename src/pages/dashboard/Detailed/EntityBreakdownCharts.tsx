import { useMemo } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
  PieChart,
  Pie,
} from 'recharts'
import { formatKg } from '../../../utils/format'
import {
  formatChartValue,
  formatChartPercent,
  downloadCsvFile,
  CHART_HEIGHTS,
  CHART_MARGINS,
  CHART_COLORS,
  BAR_VALUE_LABEL,
} from './chart.utils'
import { renderPieValueLabel } from './chartLabels'
import { MobileChartScroll } from './MobileChartScroll'
import {
  aggregateByMonthAndEntity,
  groupMonthlyByEntity,
  groupDailyByEntityAndMonth,
  DailyFinancial,
  matchesPaymentStatus,
  MonthlyFinancial,
  PaymentStatusFilter,
  sumTotals,
  paymentStateLabel,
  TransactionRecord,
  TransactionWithEntity,
} from '../../../utils/chartTransforms'
import ChartDetailTable from './ChartDetailTable'
import { useMediaQuery } from '../../../hooks/useMediaQuery'

/**
 * Lo único que distingue un desglose del otro: los textos. La estructura de datos
 * y los gráficos son idénticos, y por eso viven una sola vez acá.
 */
export interface EntityBreakdownCopy {
  /** Singular, para el encabezado de cada entidad: "Proveedor" | "Producto". */
  entity: string
  /** Rótulo de la primera tarjeta y de la barra "Total". */
  totalLabel: string
  monthlyTitle: string
  overviewTitle: string
  perEntityTitle: string
  dailyTitle: string
  tableTitle: string
  tableFirstColumnLabel: string
  /** Primera línea del CSV exportado. */
  csvTitle: string
  csvFilename: string
}

interface EntityBreakdownChartsProps<TRow extends TransactionRecord> {
  results: TRow[]
  /** De qué campo de la fila sale la entidad por la que se desglosa. */
  entityIdOf: (row: TRow) => number
  /** Nombre de cada entidad, por id. */
  entityNames: Map<number, string>
  selectedFilter: PaymentStatusFilter
  filters: { startDate: string; endDate: string }
  copy: EntityBreakdownCopy
}

/**
 * Desglose mensual y diario de compras vs. pagos, agrupado por una entidad
 * (proveedor o producto). Ambos desgloses del dashboard detallado son esta misma
 * vista sobre el mismo eje: solo cambia de qué campo sale la entidad y cómo se
 * llama en pantalla. Ver ProductBreakdownCharts / SupplierBreakdownCharts.
 */
export function EntityBreakdownCharts<TRow extends TransactionRecord>({
  results,
  entityIdOf,
  entityNames,
  selectedFilter,
  filters,
  copy,
}: Readonly<EntityBreakdownChartsProps<TRow>>) {
  // La sección diaria es la más larga: abierta en desktop, plegada en el móvil,
  // donde si no domina todo el scroll.
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  const nameOf = useMemo(
    () => (id: number) => entityNames.get(id) ?? `${copy.entity} Desconocido #${id}`,
    [entityNames, copy.entity],
  )

  const mapped: TransactionWithEntity[] = useMemo(
    () => results.map((row) => ({ ...row, entityId: entityIdOf(row) })),
    [results, entityIdOf],
  )

  const monthlyData = useMemo(
    () => aggregateByMonthAndEntity(mapped, nameOf),
    [mapped, nameOf],
  )

  const filteredMonthlyData = useMemo<Record<string, MonthlyFinancial>>(
    () =>
      Object.fromEntries(
        Object.entries(monthlyData).filter(([, month]) =>
          matchesPaymentStatus(month, selectedFilter),
        ),
      ),
    [monthlyData, selectedFilter],
  )

  const monthlyDataArray = useMemo(
    () => Object.values(filteredMonthlyData),
    [filteredMonthlyData],
  )

  const dataByEntity = useMemo(
    () => groupMonthlyByEntity(filteredMonthlyData),
    [filteredMonthlyData],
  )

  const dailyDataByEntity = useMemo<Record<number, Record<string, DailyFinancial[]>>>(() => {
    const grouped = groupDailyByEntityAndMonth(mapped)
    return Object.fromEntries(
      Object.entries(grouped)
        .map(([entityId, months]) => [
          entityId,
          Object.fromEntries(
            Object.entries(months)
              .map(([month, days]) => [
                month,
                days.filter((day) => matchesPaymentStatus(day, selectedFilter)),
              ])
              .filter(([, days]) => days.length > 0),
          ),
        ])
        .filter(([, months]) => Object.keys(months).length > 0),
    )
  }, [mapped, selectedFilter])

  const totals = useMemo(() => sumTotals(filteredMonthlyData), [filteredMonthlyData])

  const pieTotal = totals.Pagado + totals.Pendiente
  const pieChartData = [
    {
      name: `Total Pagado (${formatChartPercent(pieTotal ? totals.Pagado / pieTotal : 0)})`,
      value: totals.Pagado,
      fill: CHART_COLORS.paid,
    },
    {
      name: `Total Pendiente (${formatChartPercent(pieTotal ? totals.Pendiente / pieTotal : 0)})`,
      value: totals.Pendiente,
      fill: CHART_COLORS.pending,
    },
  ]

  const exportToCsv = (): void => {
    const stateOf = (total: number, pagado: number, pendiente: number) =>
      pendiente === 0 && total > 0 ? 'Completo' : paymentStateLabel(total, pagado)

    const rows = monthlyDataArray.map((month) => [
      month.name,
      month.Total,
      month.Pagado,
      month.Pendiente,
      stateOf(month.Total, month.Pagado, month.Pendiente),
    ])

    downloadCsvFile(
      [
        [copy.csvTitle],
        [`Periodo: ${filters.startDate} al ${filters.endDate}`],
        [`Generado: ${new Date().toLocaleString()}`],
        [],
        ['Mes', 'Total', 'Pagado', 'Pendiente', 'Estado'],
        ...rows,
        [
          'TOTAL',
          totals.Total,
          totals.Pagado,
          totals.Pendiente,
          stateOf(totals.Total, totals.Pagado, totals.Pendiente),
        ],
      ],
      copy.csvFilename,
    )
  }

  if (!filters.startDate || !filters.endDate) {
    return (
      <div className="text-center text-(--color-text-secondary)">
        Por favor selecciona un rango de fechas.
      </div>
    )
  }

  return (
    <div>
      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-(--color-bg-surface) p-4 rounded-lg border border-(--color-border) shadow-xs flex flex-col justify-between items-center">
          <h3 className="text-sm font-medium text-(--color-text-secondary)">{copy.totalLabel}</h3>
          <p className="text-xl sm:text-2xl font-bold text-(--color-text-primary)">{formatKg(totals.Total)}</p>
        </div>
        <div className="bg-(--color-bg-surface) p-4 rounded-lg border border-(--color-border) shadow-xs flex flex-col justify-between items-center">
          <h3 className="text-sm font-medium text-(--color-text-secondary)">Total Pagado</h3>
          <p className="text-xl sm:text-2xl font-bold text-success-700">{formatKg(totals.Pagado)}</p>
        </div>
        <div className="bg-(--color-bg-surface) p-4 rounded-lg border border-(--color-border) shadow-xs flex flex-col justify-between items-center">
          <h3 className="text-sm font-medium text-(--color-text-secondary)">Total Pendiente</h3>
          <p className="text-xl sm:text-2xl font-bold text-danger-700">{formatKg(totals.Pendiente)}</p>
        </div>
      </div>

      {/* Mensual + panorama */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
        <div className="bg-(--color-bg-surface) p-4 rounded-lg border border-(--color-border) shadow-xs xl:col-span-2">
          <h2 className="text-lg xl:text-xl font-medium mb-4">{copy.monthlyTitle}</h2>
          <MobileChartScroll>
            <ResponsiveContainer width="100%" height={isDesktop ? CHART_HEIGHTS.xl : CHART_HEIGHTS.large}>
              <BarChart data={monthlyDataArray} margin={CHART_MARGINS.withBottomLabels}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(value) => formatChartValue(value)} />
                <Legend />
                <Bar dataKey="Total" name={copy.totalLabel} fill={CHART_COLORS.total}>
                  <LabelList {...BAR_VALUE_LABEL} />
                </Bar>
                <Bar dataKey="Pagado" name="Total Pagado" fill={CHART_COLORS.paid}>
                  <LabelList {...BAR_VALUE_LABEL} />
                </Bar>
                <Bar dataKey="Pendiente" name="Pendiente" fill={CHART_COLORS.pending}>
                  <LabelList {...BAR_VALUE_LABEL} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </MobileChartScroll>
        </div>

        <div className="bg-(--color-bg-surface) p-4 rounded-lg border border-(--color-border) shadow-xs">
          <h2 className="text-lg xl:text-xl font-medium mb-4">{copy.overviewTitle}</h2>
          <ResponsiveContainer width="100%" height={isDesktop ? CHART_HEIGHTS.xl : CHART_HEIGHTS.large}>
            <PieChart>
              <Pie
                data={pieChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius="70%"
                label={renderPieValueLabel}
              />
              <Tooltip formatter={(value) => formatChartValue(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Una gráfica mensual por entidad */}
      <div className="mb-6">
        <h2 className="text-xl xl:text-2xl font-semibold mb-4">{copy.perEntityTitle}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {Object.entries(dataByEntity).map(([entityId, entityData]) => (
            <div
              key={entityId}
              className="bg-(--color-bg-surface) p-4 rounded-lg border border-(--color-border) shadow-xs"
            >
              <h3 className="text-lg font-medium mb-4 text-center">{nameOf(Number(entityId))}</h3>
              <MobileChartScroll>
                <ResponsiveContainer width="100%" height={CHART_HEIGHTS.medium}>
                  <BarChart data={entityData} margin={CHART_MARGINS.standard}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" angle={-45} textAnchor="end" height={60} fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(value) => formatChartValue(value)} />
                    <Legend />
                    <Bar dataKey="Total" name="Total" fill={CHART_COLORS.total}>
                      <LabelList {...BAR_VALUE_LABEL} />
                    </Bar>
                    <Bar dataKey="Pagado" name="Pagado" fill={CHART_COLORS.paid}>
                      <LabelList {...BAR_VALUE_LABEL} />
                    </Bar>
                    <Bar dataKey="Pendiente" name="Pendiente" fill={CHART_COLORS.pending}>
                      <LabelList {...BAR_VALUE_LABEL} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </MobileChartScroll>
            </div>
          ))}
        </div>
      </div>

      {/* Distribución diaria — plegable (la sección más larga) */}
      <details className="group mb-6" open={isDesktop}>
        <summary className="mb-4 flex cursor-pointer list-none items-center justify-between gap-2 text-xl font-semibold [&::-webkit-details-marker]:hidden">
          <span>{copy.dailyTitle}</span>
          <ChevronDown
            className="h-5 w-5 text-(--color-text-secondary) transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>
        {Object.entries(dailyDataByEntity).map(([entityId, monthsData]) => {
          const monthsWithData = Object.entries(monthsData)
          if (monthsWithData.length === 0) return null

          return (
            <div key={`daily-${entityId}`} className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-(--view-accent-text,var(--color-text-link)) border-l-4 border-(--view-accent,var(--color-action-bg)) pl-3">
                {nameOf(Number(entityId))}
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {monthsWithData.map(([month, dailyData]) => (
                  <div
                    key={`${entityId}-${month}`}
                    className="bg-(--color-bg-surface) p-4 rounded-lg border border-(--color-border) shadow-xs"
                  >
                    <h4 className="text-base font-medium mb-3 text-center text-(--color-text-secondary)">
                      {month}
                    </h4>
                    <MobileChartScroll>
                      <ResponsiveContainer width="100%" height={CHART_HEIGHTS.small}>
                        <BarChart data={dailyData} margin={CHART_MARGINS.compact}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" angle={-45} textAnchor="end" height={40} fontSize={10} />
                          <YAxis fontSize={10} />
                          <Tooltip
                            formatter={(value) => formatChartValue(value)}
                            labelStyle={{ fontSize: '12px' }}
                            contentStyle={{ fontSize: '12px' }}
                          />
                          <Legend iconSize={8} />
                          <Bar dataKey="Total" name="Total" fill={CHART_COLORS.total} />
                          <Bar dataKey="Pagado" name="Pagado" fill={CHART_COLORS.paid} />
                          <Bar dataKey="Pendiente" name="Pendiente" fill={CHART_COLORS.pending} />
                        </BarChart>
                      </ResponsiveContainer>
                    </MobileChartScroll>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </details>

      <ChartDetailTable
        title={copy.tableTitle}
        firstColumnLabel={copy.tableFirstColumnLabel}
        rows={monthlyDataArray}
        totals={totals}
        onExport={exportToCsv}
      />
    </div>
  )
}

export default EntityBreakdownCharts
