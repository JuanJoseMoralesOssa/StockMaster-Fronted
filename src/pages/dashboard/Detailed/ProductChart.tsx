import React, { useMemo } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
} from 'recharts'
import { ProductReportRow } from '../../../types/DashboardResults'
import Person from '../../../types/Person'
import {
  formatChartValue,
  formatChartPercent,
  downloadCsvFile,
  CHART_HEIGHTS,
  CHART_MARGINS,
  CHART_COLORS,
} from './chart.utils'
import {
  aggregateByMonthAndEntity,
  groupMonthlyByEntity,
  groupDailyByEntityAndMonth,
  sumTotals,
  paymentStateLabel,
  TransactionWithEntity,
} from '../../../utils/chartTransforms'
import ChartDetailTable from './ChartDetailTable'
import { useMediaQuery } from '../../../hooks/useMediaQuery'

interface Filters {
  startDate: string
  endDate: string
  supplierId: string
  productId: string
}

interface ProductChartProps {
  results: ProductReportRow[]
  suppliers: Person[]
  filters: Filters
}

const ProductChart: React.FC<ProductChartProps> = ({ results, suppliers, filters }) => {
  // Keep the long daily-distribution section open on desktop but collapsed on
  // phones, where it would otherwise dominate the scroll.
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  const suppliersMap = useMemo(() => {
    const map = new Map<number, string>()
    suppliers.forEach((s) => {
      if (s.id !== undefined && s.name !== undefined) map.set(s.id, s.name)
    })
    return map
  }, [suppliers])

  const mapped: TransactionWithEntity[] = useMemo(
    () => results.map((r) => ({ ...r, entityId: r.personId })),
    [results],
  )

  const monthlyData = useMemo(
    () => aggregateByMonthAndEntity(mapped, (id) => suppliersMap.get(id) ?? 'Proveedor Desconocido'),
    [mapped, suppliersMap],
  )

  const monthlyDataArray = useMemo(() => Object.values(monthlyData), [monthlyData])

  const dataBySupplier = useMemo(() => groupMonthlyByEntity(monthlyData), [monthlyData])

  const dailyDataBySupplier = useMemo(() => groupDailyByEntityAndMonth(mapped), [mapped])

  const totals = useMemo(() => sumTotals(monthlyData), [monthlyData])

  const pieTotal = totals.Pagado + totals.Pendiente
  const pieChartData = [
    { name: `Total Pagado (${formatChartPercent(pieTotal ? totals.Pagado / pieTotal : 0)})`, value: totals.Pagado, fill: CHART_COLORS.pieBlue },
    { name: `Total Pendiente (${formatChartPercent(pieTotal ? totals.Pendiente / pieTotal : 0)})`, value: totals.Pendiente, fill: CHART_COLORS.pieOrange },
  ]

  const exportToCsv = (): void => {
    const exportData = monthlyDataArray.map((m) => ({
      Mes: m.name,
      Total: m.Total,
      Pagado: m.Pagado,
      Pendiente: m.Pendiente,
      Estado: m.Pendiente === 0 && m.Total > 0 ? 'Completo' : paymentStateLabel(m.Total, m.Pagado),
    }))

    exportData.push({
      Mes: 'TOTAL',
      Total: totals.Total,
      Pagado: totals.Pagado,
      Pendiente: totals.Pendiente,
      Estado:
        totals.Pendiente === 0 && totals.Total > 0
          ? 'Completo'
          : paymentStateLabel(totals.Total, totals.Pagado),
    })

    downloadCsvFile(
      [
        ['Reporte Mensual - Proveedores'],
        [`Periodo: ${filters.startDate} al ${filters.endDate}`],
        [`Generado: ${new Date().toLocaleString()}`],
        [],
        ['Mes', 'Total', 'Pagado', 'Pendiente', 'Estado'],
        ...exportData.map((row) => [row.Mes, row.Total, row.Pagado, row.Pendiente, row.Estado]),
      ],
      `Reporte_Proveedores_${Date.now()}.csv`,
    )
  }

  if (!filters.startDate || !filters.endDate) {
    return <div className="text-center text-(--color-text-secondary)">Por favor selecciona un rango de fechas.</div>
  }

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-(--color-bg-surface) p-4 rounded-lg border border-(--color-border) shadow-xs flex flex-col justify-between items-center">
          <h3 className="text-sm font-medium text-(--color-text-secondary)">Total Compras</h3>
          <p className="text-xl sm:text-2xl font-bold text-(--color-text-primary)">{totals.Total.toLocaleString()}</p>
        </div>
        <div className="bg-(--color-bg-surface) p-4 rounded-lg border border-(--color-border) shadow-xs flex flex-col justify-between items-center">
          <h3 className="text-sm font-medium text-(--color-text-secondary)">Total Pagado</h3>
          <p className="text-xl sm:text-2xl font-bold text-success-700">{totals.Pagado.toLocaleString()}</p>
        </div>
        <div className="bg-(--color-bg-surface) p-4 rounded-lg border border-(--color-border) shadow-xs flex flex-col justify-between items-center">
          <h3 className="text-sm font-medium text-(--color-text-secondary)">Total Pendiente</h3>
          <p className="text-xl sm:text-2xl font-bold text-danger-700">{totals.Pendiente.toLocaleString()}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-(--color-bg-surface) p-4 rounded-lg border border-(--color-border) shadow-xs">
          <h2 className="text-lg font-medium mb-4">Distribución Mensual de Pagos a Proveedores</h2>
          <div className={CHART_HEIGHTS.large}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyDataArray} margin={CHART_MARGINS.withBottomLabels}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip formatter={(value) => formatChartValue(value)} />
                <Legend />
                <Bar dataKey="Total" name="Total Compras" fill={CHART_COLORS.purchase} />
                <Bar dataKey="Pagado" name="Total Pagado" fill={CHART_COLORS.paid} />
                <Bar dataKey="Pendiente" name="Pendiente" fill={CHART_COLORS.pending} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-(--color-bg-surface) p-4 rounded-lg border border-(--color-border) shadow-xs">
          <h2 className="text-lg font-medium mb-4">Panorama General de Pagos a Proveedores</h2>
          <div className={CHART_HEIGHTS.large}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius="70%"
                />
                <Tooltip formatter={(value) => formatChartValue(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Gráficas por Proveedor */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Distribución Mensual de Pagos por Proveedor</h2>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {Object.entries(dataBySupplier).map(([personId, supplierData]) => {
            const supplierName = suppliersMap.get(parseInt(personId)) || 'Proveedor Desconocido'
            return (
              <div key={personId} className="bg-(--color-bg-surface) p-4 rounded-lg border border-(--color-border) shadow-xs">
                <h3 className="text-lg font-medium mb-4 text-center">{supplierName}</h3>
                <div className={CHART_HEIGHTS.medium}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={supplierData} margin={CHART_MARGINS.standard}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" angle={-45} textAnchor="end" height={60} fontSize={10} />
                      <YAxis fontSize={10} />
                      <Tooltip formatter={(value) => formatChartValue(value)} />
                      <Legend />
                      <Bar dataKey="Total" name="Total" fill={CHART_COLORS.purchase} />
                      <Bar dataKey="Pagado" name="Pagado" fill={CHART_COLORS.paid} />
                      <Bar dataKey="Pendiente" name="Pendiente" fill={CHART_COLORS.pending} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Distribución Diaria — collapsible (largest section; reduces scroll on mobile) */}
      <details className="group mb-6" open={isDesktop}>
        <summary className="mb-4 flex cursor-pointer list-none items-center justify-between gap-2 text-xl font-semibold [&::-webkit-details-marker]:hidden">
          <span>Distribución Diaria por Mes y Proveedor</span>
          <ChevronDown className="h-5 w-5 text-(--color-text-secondary) transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        {Object.entries(dailyDataBySupplier).map(([personId, monthsData]) => {
          const supplierName = suppliersMap.get(parseInt(personId)) || 'Proveedor Desconocido'
          const monthsWithData = Object.entries(monthsData)
          if (monthsWithData.length === 0) return null

          return (
            <div key={`daily-${personId}`} className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-(--view-accent-text,var(--color-text-link)) border-l-4 border-(--view-accent,var(--color-action-bg)) pl-3">
                {supplierName}
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {monthsWithData.map(([month, dailyData]) => (
                  <div key={`${personId}-${month}`} className="bg-(--color-bg-surface) p-4 rounded-lg border border-(--color-border) shadow-xs">
                    <h4 className="text-md font-medium mb-3 text-center text-(--color-text-secondary)">{month}</h4>
                    <div className={CHART_HEIGHTS.small}>
                      <ResponsiveContainer width="100%" height="100%">
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
                          <Bar dataKey="Total" name="Total" fill={CHART_COLORS.purchase} />
                          <Bar dataKey="Pagado" name="Pagado" fill={CHART_COLORS.paid} />
                          <Bar dataKey="Pendiente" name="Pendiente" fill={CHART_COLORS.pending} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </details>

      {/* Table */}
      <ChartDetailTable
        title="Detalle Mensual por Proveedor"
        firstColumnLabel="Mes / Proveedor"
        rows={monthlyDataArray}
        totals={totals}
        onExport={exportToCsv}
      />
    </div>
  )
}

export default React.memo(ProductChart)
