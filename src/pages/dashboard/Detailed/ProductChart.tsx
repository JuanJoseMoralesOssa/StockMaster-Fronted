import React from 'react'
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
import { EXPENSE, PURCHASE } from '../../../constants/cts'

interface Filters {
  startDate: string
  endDate: string
  supplierId: string
  productId: string
}

interface ProductChartProps {
  selectedFilter: 'all' | 'withDebt' | 'fullyPaid'
  results: ProductReportRow[]
  suppliers: Person[]
  filters: Filters
}

interface MonthlyData {
  name: string
  Total: number
  Pagado: number
  Pendiente: number
  personId: number
}

interface SupplierMonthlyData {
  month: string
  Total: number
  Pagado: number
  Pendiente: number
}

interface DailyData {
  day: string
  Total: number
  Pagado: number
  Pendiente: number
}

const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

const formatMonthName = (date: Date): string => `${monthNames[date.getMonth()]} ${date.getFullYear()}`
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

const ProductChart: React.FC<ProductChartProps> = ({
  // selectedFilter,
  results, suppliers, filters }) => {

  if (!filters.startDate || !filters.endDate) {
    return <div className="text-center text-gray-500">Por favor selecciona un rango de fechas.</div>
  }

  const suppliersMap = new Map<number, string>()
  suppliers.forEach((supplier) => {
    if (supplier.id !== undefined && supplier.name !== undefined) {
      suppliersMap.set(supplier.id, supplier.name)
    }
  })

  const monthlyData: Record<string, MonthlyData> = results.reduce((acc: Record<string, MonthlyData>, item) => {
    const date = new Date(item.date)
    const monthName = formatMonthName(date)
    const key = `${monthName}-${item.personId}` // Unique key for month and supplier
    const supplierName = suppliersMap.get(item.personId) || 'Proveedor Desconocido'

    if (!acc[key]) {
      acc[key] = {
        name: monthName + ` (${supplierName})`,
        Total: 0,
        Pagado: 0,
        Pendiente: 0,
        personId: item.personId,
      }
    }

    if (item.type === PURCHASE) {
      acc[key].Total += item.weight_kg
    } else if (item.type === EXPENSE) {
      acc[key].Pagado += item.weight_kg
    }
    acc[key].Pendiente = acc[key].Total - acc[key].Pagado
    return acc
  }, {})

  const monthlyDataArray = Object.values(monthlyData)

  // Agrupar datos por proveedor para las gráficas individuales
  const dataBySupplier: Record<number, SupplierMonthlyData[]> = {}

  monthlyDataArray.forEach((item) => {
    if (!dataBySupplier[item.personId]) {
      dataBySupplier[item.personId] = []
    }

    // Extraer solo el mes sin el nombre del proveedor
    const monthOnly = item.name.split(' (')[0]

    dataBySupplier[item.personId].push({
      month: monthOnly,
      Total: item.Total,
      Pagado: item.Pagado,
      Pendiente: item.Pendiente,
    })
  })

  // Ordenar los datos por mes para cada proveedor
  Object.keys(dataBySupplier).forEach((personId) => {
    dataBySupplier[parseInt(personId)].sort((a, b) => {
      const monthA = monthNames.indexOf(a.month.split(' ')[0])
      const monthB = monthNames.indexOf(b.month.split(' ')[0])
      return monthA - monthB
    })
  })

  // Agrupar datos por proveedor, mes y día para las gráficas diarias
  const dailyDataBySupplier: Record<number, Record<string, DailyData[]>> = {}

  results.forEach((item) => {
    const date = new Date(item.date ?? '')
    date.setTime(date.getTime() + new Date().getTimezoneOffset() * 60000)
    const monthName = formatMonthName(date)
    const dayNumber = date.getDate()
    const dayString = `Día ${dayNumber}`

    if (!dailyDataBySupplier[item.personId]) {
      dailyDataBySupplier[item.personId] = {}
    }

    if (!dailyDataBySupplier[item.personId][monthName]) {
      dailyDataBySupplier[item.personId][monthName] = []
    }

    // Buscar si ya existe el día en el array
    let existingDay = dailyDataBySupplier[item.personId][monthName].find(d => d.day === dayString)

    if (!existingDay) {
      existingDay = {
        day: dayString,
        Total: 0,
        Pagado: 0,
        Pendiente: 0,
      }
      dailyDataBySupplier[item.personId][monthName].push(existingDay)
    }

    if (item.type === PURCHASE) {
      existingDay.Total += item.weight_kg
    } else if (item.type === EXPENSE) {
      existingDay.Pagado += item.weight_kg
    }
    existingDay.Pendiente = existingDay.Total - existingDay.Pagado
  })

  // Ordenar los días dentro de cada mes para cada proveedor
  Object.keys(dailyDataBySupplier).forEach((personId) => {
    Object.keys(dailyDataBySupplier[parseInt(personId)]).forEach((month) => {
      dailyDataBySupplier[parseInt(personId)][month].sort((a, b) => {
        const dayA = parseInt(a.day.replace('Día ', ''))
        const dayB = parseInt(b.day.replace('Día ', ''))
        return dayA - dayB
      })
    })
  })

  const totals = {
    Total: Object.values(monthlyData).reduce((acc, d) => acc + d.Total, 0),
    Pagado: Object.values(monthlyData).reduce((acc, d) => acc + d.Pagado, 0),
    Pendiente: Object.values(monthlyData).reduce((acc, d) => acc + d.Pendiente, 0),
  }

  const state = (m: MonthlyData): string => {
    if (m.Total === 0) {
      return 'Sin movimientos'
    }
    return `${((m.Pagado / m.Total) * 100).toFixed(2)}% Pagado`
  }

  const exportToExcel = async (): Promise<void> => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Pagos Proveedores')

    const exportData = Object.values(monthlyData).map((m) => ({
      Mes: m.name,
      Total: m.Total,
      Pagado: m.Pagado,
      Pendiente: m.Pendiente,
      Estado:
        m.Pendiente === 0 && m.Total > 0
          ? 'Completo'
          : state(m),
    }))

    exportData.push({
      Mes: 'TOTAL',
      Total: totals.Total,
      Pagado: totals.Pagado,
      Pendiente: totals.Pendiente,
      Estado:
        totals.Pendiente === 0 && totals.Total > 0
          ? 'Completo'
          : `${((totals.Pagado / totals.Total) * 100).toFixed(2)}% Pagado`,
    })

    // Header superior
    worksheet.addRow(['Reporte Mensual - Proveedores'])
    worksheet.addRow([`Período: ${filters.startDate} al ${filters.endDate}`])
    worksheet.addRow([`Generado: ${new Date().toLocaleString()}`])
    worksheet.addRow([])

    // Header tabla
    worksheet.addRow(['Mes', 'Total', 'Pagado', 'Pendiente', 'Estado'])

    // Data
    exportData.forEach((row) => {
      worksheet.addRow([
        row.Mes,
        row.Total,
        row.Pagado,
        row.Pendiente,
        row.Estado,
      ])
    })

    // Estilos header tabla
    const headerRow = worksheet.getRow(5)
    headerRow.font = { bold: true }
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'D9E1F2' },
      }
    })

    // Auto width columnas
    worksheet.columns.forEach((column) => {
      let maxLength = 10

      column.eachCell?.({ includeEmpty: true }, (cell) => {
        const value = cell.value ? cell.value.toString() : ''
        maxLength = Math.max(maxLength, value.length)
      })

      column.width = maxLength + 2
    })

    // Descargar archivo
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Reporte_Proveedores_${Date.now()}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  // Colores para gráficos
  const pieChartData = [
    {
      name: 'Total Pagado',
      value: totals.Pagado,
      fill: '#0088FE',
    },
    {
      name: 'Total Pendiente',
      value: totals.Pendiente,
      fill: '#FF8042',
    },
  ]

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
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyDataArray} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip formatter={(value) => formatChartValue(value)} />
              <Legend />
              <Bar dataKey="Total" name="Total Compras" fill="#8884d8" />
              <Bar dataKey="Pagado" name="Total Pagado" fill="#82ca9d" />
              <Bar dataKey="Pendiente" name="Pendiente" fill="#ff8042" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Panorama General de Pagos a Proveedores</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) =>
                  `${name}: ${formatChartPercent(percent)}`
                }
              />
              <Tooltip formatter={(value) => formatChartValue(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Nueva sección: Gráficas por Proveedor */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Distribución Mensual de Pagos por Proveedor</h2>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {Object.entries(dataBySupplier).map(([personId, supplierData]) => {
            const supplierName = suppliersMap.get(parseInt(personId)) || 'Proveedor Desconocido'
            return (
              <div key={personId} className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4 text-center">{supplierName}</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={supplierData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      fontSize={12}
                    />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(value) => formatChartValue(value)} />
                    <Legend />
                    <Bar dataKey="Total" name="Total" fill="#8884d8" />
                    <Bar dataKey="Pagado" name="Pagado" fill="#82ca9d" />
                    <Bar dataKey="Pendiente" name="Pendiente" fill="#ff8042" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )
          })}
        </div>
      </div>

      {/* Distribución Diaria por Mes para cada Proveedor */}
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
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={dailyData} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="day"
                          angle={-45}
                          textAnchor="end"
                          height={40}
                          fontSize={10}
                        />
                        <YAxis fontSize={10} />
                        <Tooltip
                          formatter={(value) => formatChartValue(value)}
                          labelStyle={{ fontSize: '12px' }}
                          contentStyle={{ fontSize: '12px' }}
                        />
                        <Legend iconSize={8} />
                        <Bar dataKey="Total" name="Total" fill="#8884d8" />
                        <Bar dataKey="Pagado" name="Pagado" fill="#82ca9d" />
                        <Bar dataKey="Pendiente" name="Pendiente" fill="#ff8042" />
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
            className='px-4 py-2 rounded-lg text-green-700 text-[13.5px] font-semibold bg-green-50 hover:bg-green-100 border-[1.5px] border-green-200 hover:border-green-300 transition-all flex items-center justify-center gap-2'
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
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
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      Sin movimientos
                    </span>
                  )}
                  {
                    month.Total !== 0 && month.Pendiente === 0 && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Completo
                      </span>
                    )
                  }
                  {
                    month.Total !== 0 && month.Pendiente !== 0 &&
                    (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        {((month.Pagado / month.Total) * 100).toFixed(1)}% Pagado
                      </span>
                    )
                  }
                </td>
              </tr>
            ))}

            {/* Summary row */}
            <tr className="bg-gray-50 font-semibold">
              <td className="px-6 py-4 whitespace-nowrap">TOTAL</td>
              <td className="px-6 py-4 whitespace-nowrap">{totals.Total.toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-green-600">{totals.Pagado.toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-red-600">{totals.Pendiente.toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {totals.Total === 0 && (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                    Sin movimientos
                  </span>
                )}
                {totals.Total !== 0 && totals.Pendiente === 0 && (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Completo
                  </span>
                )}
                {totals.Total !== 0 && totals.Pendiente !== 0 &&
                  (
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
