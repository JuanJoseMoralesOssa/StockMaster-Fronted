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
  LabelList,
  ResponsiveContainer,
  PieChart,
  Pie,
} from 'recharts'
import { PersonReportRow } from '../../../types/DashboardResults'
import Product from '../../../types/Product'
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
  TransactionWithEntity,
} from '../../../utils/chartTransforms'
import ChartDetailTable from './ChartDetailTable'
import { useMediaQuery } from '../../../hooks/useMediaQuery'

interface Filters { startDate: string; endDate: string; supplierId: string; productId: string }

interface ProductReportProps {
  results: PersonReportRow[]
  products: Partial<Product>[]
  filters: Filters
  selectedFilter: PaymentStatusFilter
}

const ProductReport: React.FC<ProductReportProps> = ({ results, products, filters, selectedFilter }) => {
  // Keep the long daily-distribution section open on desktop but collapsed on
  // phones, where it would otherwise dominate the scroll.
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  const productsMap = useMemo(() => {
    const map = new Map<number, string>()
    products.forEach((p) => {
      if (p.id !== undefined && p.name !== undefined) map.set(p.id, p.name)
    })
    return map
  }, [products])

  const mapped: TransactionWithEntity[] = useMemo(
    () => results.map((r) => ({ ...r, entityId: r.productId })),
    [results],
  )

  const monthlyData = useMemo(
    () => aggregateByMonthAndEntity(mapped, (id) => productsMap.get(id) ?? 'Desconocido'),
    [mapped, productsMap],
  )

  const filteredMonthlyData = useMemo<Record<string, MonthlyFinancial>>(
    () => Object.fromEntries(
      Object.entries(monthlyData).filter(([, month]) => matchesPaymentStatus(month, selectedFilter)),
    ),
    [monthlyData, selectedFilter],
  )

  const monthlyDataArray = useMemo(() => Object.values(filteredMonthlyData), [filteredMonthlyData])

  const dataByProduct = useMemo(() => groupMonthlyByEntity(filteredMonthlyData), [filteredMonthlyData])

  const dailyDataByProduct = useMemo<Record<number, Record<string, DailyFinancial[]>>>(() => {
    const grouped = groupDailyByEntityAndMonth(mapped)
    return Object.fromEntries(
      Object.entries(grouped)
        .map(([entityId, months]) => [
          entityId,
          Object.fromEntries(
            Object.entries(months)
              .map(([month, days]) => [
                month,
                days.filter(day => matchesPaymentStatus(day, selectedFilter)),
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
        ['Reporte Mensual - Productos'],
        [`Periodo: ${filters.startDate} al ${filters.endDate}`],
        [`Generado: ${new Date().toLocaleString()}`],
        [],
        ['Mes', 'Total', 'Pagado', 'Pendiente', 'Estado'],
        ...exportData.map((row) => [row.Mes, row.Total, row.Pagado, row.Pendiente, row.Estado]),
      ],
      `Reporte_Producto_${filters.supplierId}.csv`,
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-center text-(--color-text-secondary) p-8">
        <h3 className="text-lg font-semibold mb-2">No hay datos para mostrar</h3>
        <p>No se encontraron productos para el rango de fechas seleccionado.</p>
        <p className="text-sm mt-2">Filtros: {filters.startDate} - {filters.endDate}</p>
      </div>
    )
  }

  if (!filters.supplierId || !filters.startDate || !filters.endDate) {
    return <div className="text-center text-(--color-text-secondary)">Por favor selecciona un producto y un rango de fechas.</div>
  }

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-(--color-bg-surface) p-4 rounded-lg border border-(--color-border) shadow-xs flex flex-col justify-between items-center">
          <h3 className="text-sm font-medium text-(--color-text-secondary)">Total Pedido</h3>
          <p className="text-2xl font-bold text-(--color-text-primary)">{totals.Total.toLocaleString()}</p>
        </div>
        <div className="bg-(--color-bg-surface) p-4 rounded-lg border border-(--color-border) shadow-xs flex flex-col justify-between items-center">
          <h3 className="text-sm font-medium text-(--color-text-secondary)">Total Pagado</h3>
          <p className="text-2xl font-bold text-success-700">{totals.Pagado.toLocaleString()}</p>
        </div>
        <div className="bg-(--color-bg-surface) p-4 rounded-lg border border-(--color-border) shadow-xs flex flex-col justify-between items-center">
          <h3 className="text-sm font-medium text-(--color-text-secondary)">Total Pendiente</h3>
          <p className="text-2xl font-bold text-danger-700">{totals.Pendiente.toLocaleString()}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
        <div className="bg-(--color-bg-surface) p-4 rounded-lg border border-(--color-border) shadow-xs xl:col-span-2">
          <h2 className="text-lg xl:text-xl font-medium mb-4">Distribución Mensual de Pagos</h2>
          <MobileChartScroll>
          <ResponsiveContainer width="100%" height={isDesktop ? CHART_HEIGHTS.xl : CHART_HEIGHTS.large}>
            <BarChart data={monthlyDataArray} margin={CHART_MARGINS.withBottomLabels}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(value) => formatChartValue(value)} />
              <Legend />
              <Bar dataKey="Total" name="Total Pedido" fill={CHART_COLORS.purchase}>
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
          <h2 className="text-lg xl:text-xl font-medium mb-4">Panorama General de Pagos</h2>
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

      {/* Gráficas por Producto */}
      <div className="mb-6">
        <h2 className="text-xl xl:text-2xl font-semibold mb-4">Distribución Mensual de Pagos por Producto</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {Object.entries(dataByProduct).map(([productId, productData]) => {
            const productName = productsMap.get(parseInt(productId)) || 'Desconocido'
            return (
              <div key={productId} className="bg-(--color-bg-surface) p-4 rounded-lg border border-(--color-border) shadow-xs">
                <h3 className="text-lg font-medium mb-4 text-center">{productName}</h3>
                <ResponsiveContainer width="100%" height={CHART_HEIGHTS.medium}>
                  <BarChart data={productData} margin={CHART_MARGINS.standard}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" angle={-45} textAnchor="end" height={60} fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(value) => formatChartValue(value)} />
                    <Legend />
                    <Bar dataKey="Total" name="Total" fill={CHART_COLORS.purchase}>
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
              </div>
            )
          })}
        </div>
      </div>

      {/* Distribución Diaria — collapsible (largest section; reduces scroll on mobile) */}
      <details className="group mb-6" open={isDesktop}>
        <summary className="mb-4 flex cursor-pointer list-none items-center justify-between gap-2 text-xl font-semibold [&::-webkit-details-marker]:hidden">
          <span>Distribución Diaria por Mes y Producto</span>
          <ChevronDown className="h-5 w-5 text-(--color-text-secondary) transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        {Object.entries(dailyDataByProduct).map(([productId, monthsData]) => {
          const productName = productsMap.get(parseInt(productId)) || 'Desconocido'
          const monthsWithData = Object.entries(monthsData)
          if (monthsWithData.length === 0) return null

          return (
            <div key={`daily-${productId}`} className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-(--view-accent-text,var(--color-text-link)) border-l-4 border-(--view-accent,var(--color-action-bg)) pl-3">
                {productName}
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {monthsWithData.map(([month, dailyData]) => (
                  <div key={`${productId}-${month}`} className="bg-(--color-bg-surface) p-4 rounded-lg border border-(--color-border) shadow-xs">
                    <h4 className="text-base font-medium mb-3 text-center text-(--color-text-secondary)">{month}</h4>
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
                        <Bar dataKey="Total" name="Total" fill={CHART_COLORS.purchase} />
                        <Bar dataKey="Pagado" name="Pagado" fill={CHART_COLORS.paid} />
                        <Bar dataKey="Pendiente" name="Pendiente" fill={CHART_COLORS.pending} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </details>

      {/* Table */}
      <ChartDetailTable
        title="Detalle Mensual"
        firstColumnLabel="Mes"
        rows={monthlyDataArray}
        totals={totals}
        onExport={exportToCsv}
      />
    </div>
  )
}

export default ProductReport
