import React, { useMemo } from 'react'
import ExcelJS from 'exceljs'
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
  downloadXlsxBlob,
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
  if (!filters.startDate || !filters.endDate) {
    return <div className="text-center text-gray-500">Por favor selecciona un rango de fechas.</div>
  }

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

  const pieChartData = [
    { name: 'Total Pagado', value: totals.Pagado, fill: CHART_COLORS.pieBlue },
    { name: 'Total Pendiente', value: totals.Pendiente, fill: CHART_COLORS.pieOrange },
  ]

  const exportToExcel = async (): Promise<void> => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Pagos Proveedores')

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

    worksheet.addRow(['Reporte Mensual - Proveedores'])
    worksheet.addRow([`Período: ${filters.startDate} al ${filters.endDate}`])
    worksheet.addRow([`Generado: ${new Date().toLocaleString()}`])
    worksheet.addRow([])
    worksheet.addRow(['Mes', 'Total', 'Pagado', 'Pendiente', 'Estado'])

    exportData.forEach((row) => {
      worksheet.addRow([row.Mes, row.Total, row.Pagado, row.Pendiente, row.Estado])
    })

    const headerRow = worksheet.getRow(5)
    headerRow.font = { bold: true }
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: CHART_COLORS.headerFill } }
    })

    worksheet.columns.forEach((column) => {
      let maxLength = 10
      column.eachCell?.({ includeEmpty: true }, (cell) => {
        const value = cell.value ? cell.value.toString() : ''
        maxLength = Math.max(maxLength, value.length)
      })
      column.width = maxLength + 2
    })

    const buffer = await workbook.xlsx.writeBuffer()
    await downloadXlsxBlob(buffer as ArrayBuffer, `Reporte_Proveedores_${Date.now()}.xlsx`)
  }

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow flex flex-col justify-between items-center">
          <h3 className="text-sm font-medium text-gray-500">Total Compras</h3>
          <p className="text-2xl font-bold text-gray-600">{totals.Total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex flex-col justify-between items-center">
          <h3 className="text-sm font-medium text-gray-500">Total Pagado</h3>
          <p className="text-2xl font-bold text-green-600">{totals.Pagado}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex flex-col justify-between items-center">
          <h3 className="text-sm font-medium text-gray-500">Total Pendiente</h3>
          <p className="text-2xl font-bold text-red-600">{totals.Pendiente}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Distribución Mensual de Pagos a Proveedores</h2>
          <ResponsiveContainer width="100%" height={CHART_HEIGHTS.large}>
            <BarChart data={monthlyDataArray} margin={CHART_MARGINS.withBottomLabels}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip formatter={(value) => formatChartValue(value)} />
              <Legend />
              <Bar dataKey="Total" name="Total Compras" fill={CHART_COLORS.purchase} />
              <Bar dataKey="Pagado" name="Total Pagado" fill={CHART_COLORS.paid} />
              <Bar dataKey="Pendiente" name="Pendiente" fill={CHART_COLORS.pending} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Panorama General de Pagos a Proveedores</h2>
          <ResponsiveContainer width="100%" height={CHART_HEIGHTS.large}>
            <PieChart>
              <Pie
                data={pieChartData}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name}: ${formatChartPercent(percent)}`}
              />
              <Tooltip formatter={(value) => formatChartValue(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráficas por Proveedor */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Distribución Mensual de Pagos por Proveedor</h2>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {Object.entries(dataBySupplier).map(([personId, supplierData]) => {
            const supplierName = suppliersMap.get(parseInt(personId)) || 'Proveedor Desconocido'
            return (
              <div key={personId} className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4 text-center">{supplierName}</h3>
                <ResponsiveContainer width="100%" height={CHART_HEIGHTS.medium}>
                  <BarChart data={supplierData} margin={CHART_MARGINS.standard}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" angle={-45} textAnchor="end" height={60} fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(value) => formatChartValue(value)} />
                    <Legend />
                    <Bar dataKey="Total" name="Total" fill={CHART_COLORS.purchase} />
                    <Bar dataKey="Pagado" name="Pagado" fill={CHART_COLORS.paid} />
                    <Bar dataKey="Pendiente" name="Pendiente" fill={CHART_COLORS.pending} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )
          })}
        </div>
      </div>

      {/* Distribución Diaria */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Distribución Diaria por Mes y Proveedor</h2>
        {Object.entries(dailyDataBySupplier).map(([personId, monthsData]) => {
          const supplierName = suppliersMap.get(parseInt(personId)) || 'Proveedor Desconocido'
          const monthsWithData = Object.entries(monthsData)
          if (monthsWithData.length === 0) return null

          return (
            <div key={`daily-${personId}`} className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-blue-700 border-l-4 border-blue-500 pl-3">
                {supplierName}
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {monthsWithData.map(([month, dailyData]) => (
                  <div key={`${personId}-${month}`} className="bg-white p-4 rounded-lg shadow border">
                    <h4 className="text-md font-medium mb-3 text-center text-gray-700">{month}</h4>
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
      </div>

      {/* Table */}
      <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Detalle Mensual por Proveedor</h2>
          <button
            onClick={exportToExcel}
            className="px-4 py-2 rounded-lg text-green-700 text-[13.5px] font-semibold bg-green-50 hover:bg-green-100 border-[1.5px] border-green-200 hover:border-green-300 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Exportar a Excel
          </button>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mes / Proveedor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pagado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pendiente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {monthlyDataArray.map((month) => (
              <tr key={month.name} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-medium">{month.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{month.Total.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-green-600">{month.Pagado.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-red-600">{month.Pendiente.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {month.Total === 0 && (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Sin movimientos</span>
                  )}
                  {month.Total !== 0 && month.Pendiente === 0 && (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Completo</span>
                  )}
                  {month.Total !== 0 && month.Pendiente !== 0 && (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      {((month.Pagado / month.Total) * 100).toFixed(1)}% Pagado
                    </span>
                  )}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-semibold">
              <td className="px-6 py-4 whitespace-nowrap">TOTAL</td>
              <td className="px-6 py-4 whitespace-nowrap">{totals.Total.toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-green-600">{totals.Pagado.toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-red-600">{totals.Pendiente.toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {totals.Total === 0 && (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Sin movimientos</span>
                )}
                {totals.Total !== 0 && totals.Pendiente === 0 && (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Completo</span>
                )}
                {totals.Total !== 0 && totals.Pendiente !== 0 && (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    {((totals.Pagado / totals.Total) * 100).toFixed(1)}% Pagado
                  </span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default React.memo(ProductChart)
