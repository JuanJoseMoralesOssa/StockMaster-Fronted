import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Person from '../../types/Person';
import * as XLSX from 'xlsx';

export default function SupplierPaymentReport() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [suppliers, setSuppliers] = useState<Person[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });


  // Colores para los gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a83232', '#8884d8'];

  useEffect(() => {
    // Simulación de datos - en una aplicación real, esto vendría de tu API
    const fetchData = async () => {
      try {
        setLoading(true);
        // Aquí harías una llamada real a tu API, algo como:
        // const response = await fetch('/api/supplier-payments?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}');
        // const data = await response.json();

        // Simulación de datos para demostración
        const mockData = [
          {
            id: 1,
            name: 'Proveedor A',
            purchases: [
              { date: '2025-04-20', total_kg: 800 },
              { date: '2025-04-25', total_kg: 1500 }
            ],
            expenses: [
              { date: '2025-04-20', total_kg: 700 },
              { date: '2025-04-25', total_kg: 1000 }
            ]
          },
          {
            id: 2,
            name: 'Proveedor B',
            purchases: [
              { date: '2025-04-15', total_kg: 1000 },
              { date: '2025-04-20', total_kg: 800 }
            ],
            expenses: [
              { date: '2025-04-20', total_kg: 700 },
              { date: '2025-04-25', total_kg: 500 }
            ]
          },
          {
            id: 3,
            name: 'Proveedor C',
            purchases: [
              { date: '2025-04-10', total_kg: 1500 },
              { date: '2025-04-15', total_kg: 1000 }
            ],
            expenses: [
              { date: '2025-04-20', total_kg: 1200 },
              { date: '2025-04-25', total_kg: 1000 }
            ]
          },
          {
            id: 4,
            name: 'Proveedor D',
            purchases: [
              { date: '2025-03-30', total_kg: 2000 },
              { date: '2025-04-10', total_kg: 1500 }
            ],
            expenses: [
              { date: '2025-04-20', total_kg: 1500 },
              { date: '2025-04-25', total_kg: 1000 }
            ]
          }
        ];

        setSuppliers(mockData);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar los datos de pagos');
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  // Filtrar proveedores según el tipo seleccionado
  const filteredSuppliers = suppliers.filter(supplier => {
    if (selectedFilter === 'all') return true;
    const suppliersTotalOwed = supplier.purchases?.reduce((acc, expense) => acc + expense.total_kg, 0) ?? 0;
    const suppliersTotalPaid = supplier.expenses?.reduce((acc, purchase) => acc + purchase.total_kg, 0) ?? 0;
    const totalOwed = suppliersTotalOwed - suppliersTotalPaid;
    if (selectedFilter === 'withDebt') return totalOwed > 0;
    if (selectedFilter === 'fullyPaid') return totalOwed === 0;
    return true;
  });

  // Datos para gráfico de barras
  const barChartData = filteredSuppliers.map(supplier => {
    const suppliersTotalOwed = supplier.purchases?.reduce((acc, purchase) => acc + purchase.total_kg, 0) ?? 0;
    const suppliersTotalPaid = supplier.expenses?.reduce((acc, expense) => acc + expense.total_kg, 0) ?? 0;
    let totalBuy = suppliersTotalOwed - suppliersTotalPaid;
    if (totalBuy < 0) totalBuy *= -1;
    return {
      name: supplier.name,
      Pagado: suppliersTotalPaid,
      Total: suppliersTotalOwed,
      Pendiente: totalBuy
    }
  });

  let Owed = filteredSuppliers.reduce((sum, supplier) => sum + (supplier.purchases?.reduce((acc, purchase) => acc + purchase.total_kg, 0) ?? 0), 0)


  // Datos para gráfico de pastel
  const totalPaid = filteredSuppliers.reduce((sum, supplier) => sum + (supplier.expenses?.reduce((acc, expense) => acc + expense.total_kg, 0) ?? 0), 0);
  let totalOwed = filteredSuppliers.reduce((sum, supplier) => sum + (supplier.purchases?.reduce((acc, purchase) => acc + purchase.total_kg, 0) ?? 0), 0) - totalPaid;
  if (totalOwed < 0) totalOwed *= -1;
  const pieChartData = [
    { name: 'Total Pagado', value: totalPaid },
    { name: 'Total Pendiente', value: totalOwed },
  ];

  const exportToExcel = () => {
    // Preparar los datos para la exportación
    const exportData = filteredSuppliers.map(supplier => {
      const totalPurchases = supplier.purchases?.reduce((acc, purchase) => acc + purchase.total_kg, 0) ?? 0;
      const totalExpenses = supplier.expenses?.reduce((acc, expense) => acc + expense.total_kg, 0) ?? 0;
      const pendingAmount = totalPurchases - totalExpenses;
      const paymentStatus = pendingAmount === 0 ? 'Completo' : `${((totalExpenses / totalPurchases) * 100).toFixed(2)}% Pagado`;

      return {
        'Proveedor': supplier.name,
        'Total': totalPurchases,
        'Pagado': totalExpenses,
        'Pendiente': pendingAmount,
        'Estado': paymentStatus
      };
    });

    // Añadir encabezado con información del reporte
    const headerData = [
      ['Reporte de Pagos a Proveedores'],
      [`Período: ${dateRange.startDate} al ${dateRange.endDate}`],
      [`Generado el: ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}`],
      ['']  // Fila vacía para separación
    ];

    // Crear una nueva hoja de cálculo
    // Insertar el encabezado al inicio de la hoja
    const worksheet = XLSX.utils.json_to_sheet(headerData);
    // Desplazar los datos existentes
    const dataStartRow = headerData.length;
    XLSX.utils.sheet_add_json(worksheet, exportData, { origin: `A${dataStartRow + 1}` });


    // Dar formato a los números como moneda (opcional)
    const currencyColumns = ['B', 'C', 'D']; // Columnas con valores monetarios
    const range = XLSX.utils.decode_range(worksheet['!ref'] ?? 'A1');

    for (let c = 0; c <= range.e.c; c++) {
      const col = XLSX.utils.encode_col(c);
      if (currencyColumns.includes(col)) {
        for (let r = 1; r <= range.e.r; r++) {
          const cellAddress = col + (r + 1);
          if (worksheet[cellAddress]) {
            worksheet[cellAddress].z = '"$"#,##0.00';
          }
        }
      }
    }

    // Crear el libro y añadir la hoja
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pagos a Proveedores');

    // Generar el archivo y descargarlo
    XLSX.writeFile(workbook, `Reporte_Pagos_Proveedores_${dateRange.startDate}_${dateRange.endDate}.xlsx`);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-xl font-semibold text-blue-600">Cargando datos...</div>
    </div>
  );

  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
      {error}
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Reporte de Pagos a Proveedores</h1>

      {/* Filtros y controles */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div className="flex gap-4">
            <div>
              <label htmlFor='startDate' className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
              <input
                id='startDate'
                name='startDate'
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="border rounded p-2"
              />
            </div>
            <div>
              <label htmlFor='endDate' className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
              <input
                id='endDate'
                name='endDate'
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="border rounded p-2"
              />
            </div>
          </div>

          <div>
            <label htmlFor='filter' className="block text-sm font-medium text-gray-700 mb-1">Filtrar por</label>
            <select
              id='filter'
              name='filter'
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="border rounded p-2 w-fit"
            >
              <option value="all">Todos</option>
              <option value="withDebt">Con deuda</option>
              <option value="fullyPaid">Pagados totalmente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resumen general */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 justify-center items-center">
        <div className="bg-white p-4 rounded-lg shadow flex flex-col justify-between items-center">
          <h3 className="text-sm font-medium text-gray-500">Total Pedido</h3>
          <p className="text-2xl font-bold text-gray-600">{Owed}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex flex-col justify-between items-center">
          <h3 className="text-sm font-medium text-gray-500">Total Pagado</h3>
          <p className="text-2xl font-bold text-green-600">{pieChartData[0].value.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow flex flex-col justify-between items-center">
          <h3 className="text-sm font-medium text-gray-500">Total Pendiente</h3>
          <p className="text-2xl font-bold text-red-600">{pieChartData[1].value.toLocaleString()}</p>
        </div>
        <div className='bg-white py-3 px-4 rounded-lg shadow flex flex-col gap-1'>
          <div className="flex gap-4 items-center justify-center md:justify-between">
            <h3 className="text-sm font-medium text-gray-500">Proveedores con deuda</h3>
            <p className="text-xl font-bold text-blue-600">
              {suppliers.filter(s => {
                const totalOwed = (s.purchases?.reduce((acc, purchase) => acc + purchase.total_kg, 0) ?? 0) -
                  (s.expenses?.reduce((acc, expense) => acc + expense.total_kg, 0) ?? 0);
                return totalOwed > 0;
              }).length}
            </p>
          </div>
          <div className="flex gap-4 items-center justify-center md:justify-between">
            <h3 className="text-sm font-medium text-gray-500">Total Proveedores</h3>
            <p className="text-xl font-bold text-gray-800">{suppliers.length} </p>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Distribución de Pagos</h2>
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
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${entry.name}`} fill={index === 0 ? '#4ade80' : '#f87171'} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla de Proveedores */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <section className='flex flex-col md:flex-row justify-between items-center bg-gray-50 border-b border-gray-400'>
          <h2 className="text-lg font-semibold p-4 ">Detalle por Proveedor</h2>
          <div className='flex items-end w-full md:w-fit gap-4 p-4'>
            <button
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pagado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pendiente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{supplier.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{((supplier.purchases?.reduce((acc, purchase) => acc + purchase.total_kg, 0) ?? 0).toLocaleString())}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-600">{(supplier.expenses?.reduce((acc, expense) => acc + expense.total_kg, 0) ?? 0).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-red-600">
                    {((supplier.purchases?.reduce((acc, purchase) => acc + purchase.total_kg, 0) ?? 0) -
                      (supplier.expenses?.reduce((acc, expense) => acc + expense.total_kg, 0) ?? 0)).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(() => {
                      const supplierTotalOwed = supplier.purchases?.reduce((acc, purchase) => acc + purchase.total_kg, 0) ?? 0;
                      const supplierTotalPaid = supplier.expenses?.reduce((acc, expense) => acc + expense.total_kg, 0) ?? 0;
                      const supplierPending = supplierTotalOwed - supplierTotalPaid;

                      return supplierPending <= 0 ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Completo
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {((supplierTotalPaid / supplierTotalOwed) * 100).toFixed(2)}% Pagado
                        </span>
                      );
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
