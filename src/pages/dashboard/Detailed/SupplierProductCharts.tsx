import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie } from 'recharts'
import Person from '../../../types/Person'
import Product from '../../../types/Product'
import { DashboardResult } from '../../../types/DashboardResults'
import { EXPENSE, PURCHASE } from '../../../constants/cts'
import { FileSpreadsheet, ChevronDown } from 'lucide-react'
import { formatChartValue, formatChartPercent, downloadXlsxBlob, CHART_HEIGHTS, CHART_MARGINS, CHART_COLORS } from './chart.utils'
import { processDailyEntries, processMonthlyEntries, groupDailyEntriesByMonth } from '../../../utils/chartTransforms'
import { Button } from '../../../components/ui'

const TH = 'px-3 sm:px-6 py-3 text-left text-xs font-medium text-(--color-text-secondary) uppercase tracking-wider'
const TH_NUMERIC = 'px-3 sm:px-6 py-3 text-right text-xs font-medium text-(--color-text-secondary) uppercase tracking-wider tabular-nums'
const TD = 'px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap'
const TD_NUMERIC = 'px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right tabular-nums'

interface SupplierAndProductProps {
  results: DashboardResult[]
  supplier: Person
  product: Product
  selectedFilter: string
  filters: { startDate: string; endDate: string; supplierId: string; productId: string }
}

function SupplierProductCharts({
  results,
  supplier,
  product,
  selectedFilter,
  filters,
}: Readonly<SupplierAndProductProps>) {
  const supplierName = supplier?.name || 'Desconocido'
  const productName = product.name || 'Producto Seleccionado'

  const dailyData = useMemo(() => processDailyEntries(results), [results])
  const monthlyData = useMemo(() => processMonthlyEntries(results), [results])
  const dailyByMonth = useMemo(() => groupDailyEntriesByMonth(dailyData), [dailyData])

  const productPurchases = results.filter((result) => result.type === PURCHASE)
  const productExpenses = results.filter((result) => result.type === EXPENSE)
  const totalPurchases = productPurchases.reduce((acc, purchase) => acc + purchase.weight_kg, 0)
  const totalExpenses = productExpenses.reduce((acc, expense) => acc + expense.weight_kg, 0)
  const pendingAmount = totalPurchases - totalExpenses
  const paymentStatus = pendingAmount === 0 ? 'Completo' : `${((totalExpenses / totalPurchases) * 100).toFixed(2)}% Pagado`

  const exportToExcel = async () => {
    const ExcelJS = (await import('exceljs')).default
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Pagos a Proveedores')

    // Header
    worksheet.addRow([`Reporte de Pagos del Proveedor: ${supplierName} y Producto: ${productName}`])
    worksheet.addRow([`Período: ${filters.startDate} al ${filters.endDate}`])
    worksheet.addRow([
      `Generado el: ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`
    ])
    worksheet.addRow([])

    // Merge headers
    worksheet.mergeCells('A1:F1')
    worksheet.mergeCells('A2:F2')
    worksheet.mergeCells('A3:F3')

      // Styles header
      ;[1, 2, 3].forEach(rowNumber => {
        const row = worksheet.getRow(rowNumber)
        row.font = { bold: true, size: 14 }
        row.alignment = { horizontal: 'center' }
      })

    // Table headers
    const headerRow = worksheet.addRow([
      'Fecha',
      'Día',
      'Compra',
      'Gasto',
      'Pendiente',
      'Estado'
    ])

    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4472C4' }
    }
    headerRow.alignment = { horizontal: 'center' }

    // Data rows
    dailyData.forEach(day => {
      let status = 'Sin compras'

      if (day.pendiente === 0 && day.compra > 0) {
        status = 'Completo'
      } else if (day.compra > 0) {
        status = `${((day.gasto / day.compra) * 100).toFixed(1)}% Pagado`
      }

      worksheet.addRow([
        day.date,
        day.day,
        day.compra,
        day.gasto,
        day.pendiente,
        status
      ])
    })

    // Totals row
    const totalRow = worksheet.addRow([
      'TOTAL',
      '-',
      totalPurchases,
      totalExpenses,
      pendingAmount,
      paymentStatus
    ])

    totalRow.font = { bold: true }

    // Borders for all cells
    worksheet.eachRow(row => {
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
      })
    })

    // Auto width columns
    worksheet.columns = [
      { key: 'fecha', width: 15 },
      { key: 'dia', width: 10 },
      { key: 'compra', width: 15 },
      { key: 'gasto', width: 15 },
      { key: 'pendiente', width: 15 },
      { key: 'estado', width: 18 }
    ]

    const buffer = await workbook.xlsx.writeBuffer()
    await downloadXlsxBlob(
      buffer as ArrayBuffer,
      `Reporte_Pagos_Proveedores_${filters.startDate}_${filters.endDate}.xlsx`,
    )
  }

  const barChartData = monthlyData.map(month => ({
    name: month.month,
    Total: month.total,
    Pagado: month.pagado,
    Pendiente: month.pendiente
  }))

  const pieTotal = totalExpenses + pendingAmount
  const pieData = [
    { name: `Total Pagado (${formatChartPercent(pieTotal ? totalExpenses / pieTotal : 0)})`, value: totalExpenses, fill: CHART_COLORS.green },
    { name: `Total Pendiente (${formatChartPercent(pieTotal ? pendingAmount / pieTotal : 0)})`, value: pendingAmount, fill: CHART_COLORS.red },
  ]

  return (
    <div>
      {/* Resumen general */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6 justify-center items-center">
        <div className="bg-(--color-bg-surface) p-4 rounded-lg shadow flex flex-col justify-between items-center">
          <h3 className="text-sm font-medium text-(--color-text-secondary)">Total Pedido</h3>
          <p className="text-xl sm:text-2xl font-bold text-(--color-text-secondary)">{totalPurchases.toLocaleString()}</p>
        </div>
        <div className="bg-(--color-bg-surface) p-4 rounded-lg shadow flex flex-col justify-between items-center">
          <h3 className="text-sm font-medium text-(--color-text-secondary)">Total Pagado</h3>
          <p className="text-xl sm:text-2xl font-bold text-success-700">{totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-(--color-bg-surface) p-4 rounded-lg shadow flex flex-col justify-between items-center">
          <h3 className="text-sm font-medium text-(--color-text-secondary)">Total Pendiente</h3>
          <p className="text-xl sm:text-2xl font-bold text-danger-700">{pendingAmount.toLocaleString()}</p>
        </div>
        <div className='bg-(--color-bg-surface) py-3 px-4 rounded-lg shadow flex flex-col gap-1'>
          {(selectedFilter === 'all' || selectedFilter === 'withDebt') &&
            <div className="flex gap-4 items-center justify-center md:justify-between">
              <h3 className="text-sm font-medium text-(--color-text-secondary)">Con deuda</h3>
              <p className="text-xl font-bold text-(--color-text-primary)">
                {
                  results.filter(s => {
                    const totalOwed = (s.type === PURCHASE ? s.weight_kg : 0) -
                      (s.type === EXPENSE ? s.weight_kg : 0)
                    return totalOwed > 0
                  }).length
                }
              </p>
            </div>}
          {(selectedFilter === 'all' || selectedFilter === 'fullyPaid') &&
            <div className="flex gap-4 items-center justify-center md:justify-between">
              <h3 className="text-sm font-medium text-(--color-text-secondary)">Pagados</h3>
              <p className="text-xl font-bold text-(--color-text-primary)">
                {
                  results.filter(s => {
                    const totalOwed = (s.type === PURCHASE ? s.weight_kg : 0) -
                      (s.type === EXPENSE ? s.weight_kg : 0)
                    return totalOwed <= 0
                  }).length
                }
              </p>
            </div>}
        </div>
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-(--color-bg-surface) p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-(--color-text-primary)">Distribución de Pagos por Mes</h2>
          <div className={CHART_HEIGHTS.large}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                margin={CHART_MARGINS.inline}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip formatter={(value) => formatChartValue(value)} />
                <Legend />
                <Bar dataKey="Total" fill={CHART_COLORS.blue} />
                <Bar dataKey="Pagado" fill={CHART_COLORS.green} />
                <Bar dataKey="Pendiente" fill={CHART_COLORS.red} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-(--color-bg-surface) p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-(--color-text-primary)">Panorama General</h2>
          <div className={CHART_HEIGHTS.large}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  nameKey="name"
                  outerRadius="70%"
                  dataKey="value"
                />
                <Tooltip formatter={(value) => formatChartValue(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Gráfica diaria por mes — collapsible (reduces scroll on mobile) */}
      <details className="group mb-6" open>
        <summary className="mb-4 flex cursor-pointer list-none items-center justify-between gap-2 text-lg font-semibold [&::-webkit-details-marker]:hidden">
          <span>Distribución Diaria por Mes</span>
          <ChevronDown className="h-5 w-5 text-(--color-text-secondary) transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {Object.entries(dailyByMonth).map(([month, days]) => (
            <div key={month} className="bg-(--color-bg-surface) p-4 rounded-lg shadow">
              <h3 className="text-md font-medium mb-4 text-center text-(--color-text-primary)">{month}</h3>
              <div className={CHART_HEIGHTS.medium}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={days.map(d => ({
                      día: d.day,
                      Compra: d.compra,
                      Gasto: d.gasto,
                      Pendiente: d.pendiente
                    }))}
                    margin={CHART_MARGINS.inline}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="día" fontSize={10} />
                    <YAxis fontSize={10} />
                    <Tooltip formatter={(value) => formatChartValue(value)} />
                    <Legend />
                    <Bar dataKey="Compra" fill={CHART_COLORS.blue} />
                    <Bar dataKey="Gasto" fill={CHART_COLORS.green} />
                    <Bar dataKey="Pendiente" fill={CHART_COLORS.red} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      </details>

      {/* Tabla de detalle diario */}
      <div className="bg-(--color-bg-surface) rounded-lg shadow overflow-hidden">
        <section className='flex flex-col md:flex-row justify-between items-center bg-(--color-bg-subtle) border-b border-(--color-border)'>
          <h2 className="text-lg font-semibold p-4 text-(--color-text-primary)">Detalle Diario - {supplierName} / {productName}</h2>
          <div className='flex items-end w-full md:w-fit gap-4 p-4'>
            <Button
              variant="ghost"
              size="sm"
              disabled={!dailyData.length}
              onClick={exportToExcel}
              leftIcon={<FileSpreadsheet className="h-4 w-4" aria-hidden="true" />}
              className="w-full md:w-auto text-success-700 bg-success-50 border-[1.5px] border-success-200 hover:bg-success-100 hover:border-success-300"
            >
              Exportar a Excel
            </Button>
          </div>
        </section>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-(--color-border)">
            <thead className="bg-(--color-bg-subtle)">
              <tr>
                <th className={TH}>Fecha</th>
                <th className={TH}>Día</th>
                <th className={TH_NUMERIC}>Compra</th>
                <th className={TH_NUMERIC}>Gasto</th>
                <th className={TH_NUMERIC}>Pendiente</th>
                <th className={TH}>Estado</th>
              </tr>
            </thead>
            <tbody className="bg-(--color-bg-surface) divide-y divide-(--color-border)">
              {dailyData.map((day) => (
                <tr key={day.date} className="hover:bg-(--color-bg-subtle)">
                  <td className={`${TD} font-medium text-(--color-text-primary)`}>{day.date}</td>
                  <td className={`${TD} text-(--color-text-primary)`}>{day.day}</td>
                  <td className={`${TD_NUMERIC} text-(--color-text-primary)`}>{day.compra.toLocaleString()}</td>
                  <td className={`${TD_NUMERIC} text-success-700`}>{day.gasto.toLocaleString()}</td>
                  <td className={`${TD_NUMERIC} text-danger-700`}>{day.pendiente.toLocaleString()}</td>
                  <td className={TD}>
                    {day.pendiente === 0 && day.compra > 0 ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-success-50 text-success-700">
                        Completo
                      </span>
                    ) : day.compra > 0 ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-warning-50 text-warning-700">
                        {((day.gasto / day.compra) * 100).toFixed(1)}% Pagado
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-(--color-bg-subtle) text-(--color-text-secondary)">
                        Sin compras
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {/* Fila de totales */}
              <tr className="bg-(--color-bg-subtle) font-bold">
                <td className={`${TD} text-(--color-text-primary)`}>TOTAL</td>
                <td className={`${TD} text-(--color-text-primary)`}>-</td>
                <td className={`${TD_NUMERIC} text-(--color-text-primary)`}>{totalPurchases.toLocaleString()}</td>
                <td className={`${TD_NUMERIC} text-success-700`}>{totalExpenses.toLocaleString()}</td>
                <td className={`${TD_NUMERIC} text-danger-700`}>{pendingAmount.toLocaleString()}</td>
                <td className={TD}>
                  {paymentStatus === 'Completo' ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-success-50 text-success-700">
                      Completo
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-warning-50 text-warning-700">
                      {paymentStatus}
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default SupplierProductCharts
