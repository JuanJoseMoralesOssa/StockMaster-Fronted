import ExcelJS from 'exceljs'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie } from 'recharts'
import Person from '../../../types/Person'
import Product from '../../../types/Product'
import { DashboardResult } from '../../../types/DashboardResults'
import { EXPENSE, PURCHASE } from '../../../constants/cts'


interface SupplierAndProductProps {
  results: DashboardResult[]
  supplier: Person
  product: Product
  selectedFilter: string
  filters: { startDate: string; endDate: string; supplierId: string; productId: string }
}

interface DailyData {
  day: number
  date: string
  compra: number
  gasto: number
  pendiente: number
}

interface MonthlyData {
  month: string
  total: number
  pagado: number
  pendiente: number
}

const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const formatChartValue = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join(', ')
  }
  if (typeof value === 'number') {
    return value.toLocaleString()
  }
  if (typeof value === 'string') {
    return value
  }
  return ''
}
const formatChartPercent = (percent: number | undefined): string =>
  `${((percent ?? 0) * 100).toFixed(0)}%`

function SupplierProductCharts({
  results,
  supplier,
  product,
  selectedFilter,
  filters,
}: Readonly<SupplierAndProductProps>) {
  const supplierName = supplier?.name || 'Desconocido'
  const productName = product.name || 'Producto Seleccionado'

  // Procesar datos por día
  const processDailyData = (): DailyData[] => {
    const dailyMap = new Map<string, DailyData>()

    results.forEach(result => {
      let dateKey = ''
      let day = 1
      if (result.date) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(result.date)) {
          dateKey = result.date
          day = parseInt(result.date.split('-')[2], 10)
        } else {
          const date = new Date(result.date)
          dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
          day = date.getDate()
        }
      }

      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, {
          day,
          date: dateKey,
          compra: 0,
          gasto: 0,
          pendiente: 0
        })
      }

      const dayData = dailyMap.get(dateKey)!
      if (result.type === PURCHASE) {
        dayData.compra += result.weight_kg
      } else {
        dayData.gasto += result.weight_kg
      }
      dayData.pendiente = dayData.compra - dayData.gasto
    })

    return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date))
  }

  // Procesar datos por mes
  const processMonthlyData = (): MonthlyData[] => {
    const monthlyMap = new Map<string, MonthlyData>()

    results.forEach(result => {
      const date = new Date(result.date)
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          month: monthKey,
          total: 0,
          pagado: 0,
          pendiente: 0
        })
      }

      const monthData = monthlyMap.get(monthKey)!
      if (result.type === PURCHASE) {
        monthData.total += result.weight_kg
      } else {
        monthData.pagado += result.weight_kg
      }
      monthData.pendiente = monthData.total - monthData.pagado
    })

    return Array.from(monthlyMap.values())
  }

  // Agrupar datos diarios por mes
  const groupDailyDataByMonth = () => {
    const grouped: Record<string, DailyData[]> = {}
    const dailyData = processDailyData()

    dailyData.forEach(day => {
      const date = new Date(day.date)
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`

      if (!grouped[monthKey]) {
        grouped[monthKey] = []
      }
      grouped[monthKey].push(day)
    })

    return grouped
  }

  const dailyData = processDailyData()
  const monthlyData = processMonthlyData()
  const dailyByMonth = groupDailyDataByMonth()

  const productPurchases = results.filter((result) => result.type === PURCHASE)
  const productExpenses = results.filter((result) => result.type === EXPENSE)
  const totalPurchases = productPurchases.reduce((acc, purchase) => acc + purchase.weight_kg, 0)
  const totalExpenses = productExpenses.reduce((acc, expense) => acc + expense.weight_kg, 0)
  const pendingAmount = totalPurchases - totalExpenses
  const paymentStatus = pendingAmount === 0 ? 'Completo' : `${((totalExpenses / totalPurchases) * 100).toFixed(2)}% Pagado`

  const exportToExcel = async () => {
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

    // Download file
    const buffer = await workbook.xlsx.writeBuffer()

    const blob = new Blob([buffer], {
      type:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Reporte_Pagos_Proveedores_${filters.startDate}_${filters.endDate}.xlsx`
    a.click()

    window.URL.revokeObjectURL(url)
  }

  const barChartData = monthlyData.map(month => ({
    name: month.month,
    Total: month.total,
    Pagado: month.pagado,
    Pendiente: month.pendiente
  }))

  const pieData = [
    { name: 'Total Pagado', value: totalExpenses, fill: '#4ade80' },
    { name: 'Total Pendiente', value: pendingAmount, fill: '#f87171' }
  ]

  return (
    <div>
      {/* Resumen general */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 justify-center items-center">
        <div className="bg-(--color-bg-surface) p-4 rounded-lg shadow flex flex-col justify-between items-center">
          <h3 className="text-sm font-medium text-(--color-text-muted)">Total Pedido</h3>
          <p className="text-2xl font-bold text-(--color-text-secondary)">{totalPurchases.toLocaleString()}</p>
        </div>
        <div className="bg-(--color-bg-surface) p-4 rounded-lg shadow flex flex-col justify-between items-center">
          <h3 className="text-sm font-medium text-(--color-text-muted)">Total Pagado</h3>
          <p className="text-2xl font-bold text-success-700">{totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-(--color-bg-surface) p-4 rounded-lg shadow flex flex-col justify-between items-center">
          <h3 className="text-sm font-medium text-(--color-text-muted)">Total Pendiente</h3>
          <p className="text-2xl font-bold text-danger-700">{pendingAmount.toLocaleString()}</p>
        </div>
        <div className='bg-(--color-bg-surface) py-3 px-4 rounded-lg shadow flex flex-col gap-1'>
          {(selectedFilter === 'all' || selectedFilter === 'withDebt') &&
            <div className="flex gap-4 items-center justify-center md:justify-between">
              <h3 className="text-sm font-medium text-(--color-text-muted)">Con deuda</h3>
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
              <h3 className="text-sm font-medium text-(--color-text-muted)">Pagados</h3>
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
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={barChartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatChartValue(value)} />
              <Legend />
              <Bar dataKey="Total" fill="#60a5fa" />
              <Bar dataKey="Pagado" fill="#4ade80" />
              <Bar dataKey="Pendiente" fill="#f87171" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-(--color-bg-surface) p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-(--color-text-primary)">Panorama General</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${formatChartPercent(percent)}`}
              >
              </Pie>
              <Tooltip formatter={(value) => formatChartValue(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfica diaria por mes */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Distribución Diaria por Mes</h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {Object.entries(dailyByMonth).map(([month, days]) => (
            <div key={month} className="bg-(--color-bg-surface) p-4 rounded-lg shadow">
              <h3 className="text-md font-medium mb-4 text-center text-(--color-text-primary)">{month}</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={days.map(d => ({
                    día: d.day,
                    Compra: d.compra,
                    Gasto: d.gasto,
                    Pendiente: d.pendiente
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="día" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatChartValue(value)} />
                  <Legend />
                  <Bar dataKey="Compra" fill="#60a5fa" />
                  <Bar dataKey="Gasto" fill="#4ade80" />
                  <Bar dataKey="Pendiente" fill="#f87171" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla de detalle diario */}
      <div className="bg-(--color-bg-surface) rounded-lg shadow overflow-hidden">
        <section className='flex flex-col md:flex-row justify-between items-center bg-(--color-bg-subtle) border-b border-(--color-border)'>
          <h2 className="text-lg font-semibold p-4 text-(--color-text-primary)">Detalle Diario - {supplierName} / {productName}</h2>
          <div className='flex items-end w-full md:w-fit gap-4 p-4'>
            <button
              disabled={!dailyData.length}
              onClick={exportToExcel}
              className='px-4 py-2 rounded-lg text-success-700 text-[13.5px] font-semibold bg-success-50 hover:bg-success-100 border-[1.5px] border-success-200 hover:border-success-300 transition-all flex items-center justify-center gap-2 w-full md:w-auto disabled:opacity-50'
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Exportar a Excel
            </button>
          </div>
        </section>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-(--color-border)">
            <thead className="bg-(--color-bg-subtle)">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-(--color-text-muted) uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-(--color-text-muted) uppercase tracking-wider">Día</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-(--color-text-muted) uppercase tracking-wider">Compra</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-(--color-text-muted) uppercase tracking-wider">Gasto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-(--color-text-muted) uppercase tracking-wider">Pendiente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-(--color-text-muted) uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-(--color-bg-surface) divide-y divide-(--color-border)">
              {dailyData.map((day) => (
                <tr key={day.date} className="hover:bg-(--color-bg-subtle)">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-(--color-text-primary)">{day.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-(--color-text-primary)">{day.day}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-(--color-text-primary)">{day.compra.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-success-700">{day.gasto.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-danger-700">{day.pendiente.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
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
                <td className="px-6 py-4 whitespace-nowrap text-(--color-text-primary)">TOTAL</td>
                <td className="px-6 py-4 whitespace-nowrap text-(--color-text-primary)">-</td>
                <td className="px-6 py-4 whitespace-nowrap text-(--color-text-primary)">{totalPurchases.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-success-700">{totalExpenses.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-danger-700">{pendingAmount.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
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
