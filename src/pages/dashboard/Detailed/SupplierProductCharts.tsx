import * as XLSX from 'xlsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
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
      if (result.type === 'Compra') {
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

  const exportToExcel = () => {
    const exportData = dailyData.map(day => ({
      Fecha: day.date,
      Día: day.day,
      Compra: day.compra,
      Gasto: day.gasto,
      Pendiente: day.pendiente
    }))

    // Agregar fila de totales
    exportData.push({
      Fecha: 'TOTAL',
      Día: 0,
      Compra: totalPurchases,
      Gasto: totalExpenses,
      Pendiente: pendingAmount
    })

    const headerData = [
      [`Reporte de Pagos del Proveedor: ${supplierName} y Producto: ${productName}`],
      [`Período: ${filters.startDate} al ${filters.endDate}`],
      [`Generado el: ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`],
      [''],
    ]

    const worksheet = XLSX.utils.json_to_sheet([])
    XLSX.utils.sheet_add_aoa(worksheet, headerData)
    XLSX.utils.sheet_add_json(worksheet, exportData, { origin: `A${headerData.length + 1}` })
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pagos a Proveedores')

    XLSX.writeFile(workbook, `Reporte_Pagos_Proveedores_${filters.startDate}_${filters.endDate}.xlsx`)
  }

  const barChartData = monthlyData.map(month => ({
    name: month.month,
    Total: month.total,
    Pagado: month.pagado,
    Pendiente: month.pendiente
  }))

  return (
    <div>
      {/* Resumen general */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 justify-center items-center">
        <div className="bg-white p-4 rounded-lg shadow flex flex-col justify-between items-center">
          <h3 className="text-sm font-medium text-gray-500">Total Pedido</h3>
          <p className="text-2xl font-bold text-gray-600">{totalPurchases.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex flex-col justify-between items-center">
          <h3 className="text-sm font-medium text-gray-500">Total Pagado</h3>
          <p className="text-2xl font-bold text-green-600">{totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex flex-col justify-between items-center">
          <h3 className="text-sm font-medium text-gray-500">Total Pendiente</h3>
          <p className="text-2xl font-bold text-red-600">{pendingAmount.toLocaleString()}</p>
        </div>
        <div className='bg-white py-3 px-4 rounded-lg shadow flex flex-col gap-1'>
          {(selectedFilter === 'all' || selectedFilter === 'withDebt') &&
            <div className="flex gap-4 items-center justify-center md:justify-between">
              <h3 className="text-sm font-medium text-gray-500">Con deuda</h3>
              <p className="text-xl font-bold text-blue-600">
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
              <h3 className="text-sm font-medium text-gray-500">Pagados</h3>
              <p className="text-xl font-bold text-blue-600">
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
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Distribución de Pagos por Mes</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={barChartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `${value}`} />
              <Legend />
              <Bar dataKey="Total" fill="#60a5fa" />
              <Bar dataKey="Pagado" fill="#4ade80" />
              <Bar dataKey="Pendiente" fill="#f87171" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Panorama General</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Total Pagado', value: totalExpenses },
                  { name: 'Total Pendiente', value: pendingAmount }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                <Cell fill="#4ade80" />
                <Cell fill="#f87171" />
              </Pie>
              <Tooltip formatter={(value) => `${value}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfica diaria por mes */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Distribución Diaria por Mes</h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {Object.entries(dailyByMonth).map(([month, days]) => (
            <div key={month} className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-md font-medium mb-4 text-center">{month}</h3>
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
                  <Tooltip formatter={(value) => `${value}`} />
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
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <section className='flex flex-col md:flex-row justify-between items-center bg-gray-50 border-b border-gray-400'>
          <h2 className="text-lg font-semibold p-4">Detalle Diario - {supplierName} / {productName}</h2>
          <div className='flex items-end w-full md:w-fit gap-4 p-4'>
            <button
              disabled={!dailyData.length}
              onClick={exportToExcel}
              className='px-4 py-2 rounded-2xl w-full md:w-fit text-white bg-green-600 hover:text-gray-50 hover:bg-green-700'>
              Exportar a Excel
            </button>
          </div>
        </section>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Día</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compra</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gasto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pendiente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dailyData.map((day) => (
                <tr key={day.date} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{day.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{day.day}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{day.compra.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-600">{day.gasto.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-red-600">{day.pendiente.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {day.pendiente === 0 && day.compra > 0 ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Completo
                      </span>
                    ) : day.compra > 0 ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        {((day.gasto / day.compra) * 100).toFixed(1)}% Pagado
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Sin compras
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {/* Fila de totales */}
              <tr className="bg-gray-50 font-bold">
                <td className="px-6 py-4 whitespace-nowrap">TOTAL</td>
                <td className="px-6 py-4 whitespace-nowrap">-</td>
                <td className="px-6 py-4 whitespace-nowrap">{totalPurchases.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-green-600">{totalExpenses.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-red-600">{pendingAmount.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {paymentStatus === 'Completo' ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Completo
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
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
