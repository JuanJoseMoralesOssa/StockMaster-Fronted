import * as XLSX from 'xlsx';
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
  Cell,
} from 'recharts';
import { ProductsResults } from '../../../types/DashboardResults';
import Product from '../../../types/Product';
import { EXPENSE, PURCHASE } from '../../../constants/cts';

interface Filters { startDate: string; endDate: string; supplierId: string; productId: string }

interface ProductReportProps {
  selectedFilter: 'all' | 'withDebt' | 'fullyPaid';
  results: ProductsResults[];
  products: Partial<Product>[];
  filters: Filters;
}

interface MonthlyData {
  name: string;
  Total: number;
  Pagado: number;
  Pendiente: number;
  productId: number
}

interface ProductMonthlyData {
  month: string;
  Total: number;
  Pagado: number;
  Pendiente: number;
}

interface DailyData {
  day: string;
  Total: number;
  Pagado: number;
  Pendiente: number;
}

const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const formatMonthName = (date: Date): string => `${monthNames[date.getMonth()]} ${date.getFullYear()}`;


const ProductReport: React.FC<ProductReportProps> = ({
  // selectedFilter,
  results, products, filters }) => {

  if (results.length === 0) {
    console.warn('SupplierCharts - No products found for the selected date range.');
    return (
      <div className="text-center text-gray-500 p-8">
        <h3 className="text-lg font-semibold mb-2">No hay datos para mostrar</h3>
        <p>No se encontraron productos para el rango de fechas seleccionado.</p>
        <p className="text-sm mt-2">Filtros: {filters.startDate} - {filters.endDate}</p>
      </div>
    );
  }

  // Validar filtros
  if (!filters.supplierId || !filters.startDate || !filters.endDate) {
    return <div className="text-center text-gray-500">Por favor selecciona un producto y un rango de fechas.</div>;
  }

  const productsMap = new Map<number, string>();
  products.forEach((product) => {
    if (product.id !== undefined && product.name !== undefined) {
      productsMap.set(product.id, product.name);
    }
  });



  const monthlyData: Record<string, MonthlyData> = results.reduce((acc: Record<string, MonthlyData>, product) => {
    const date = new Date(product.date);
    const monthName = formatMonthName(date);
    const key = `${monthName}-${product.productId}`; // Unique key for month and product
    const productName = productsMap.get(product.productId) || 'Desconocido';
    if (!acc[key]) {
      acc[key] = {
        name: monthName + ` (${productName})`,
        Total: 0,
        Pagado: 0,
        Pendiente: 0,
        productId: product.productId,
      };
    }

    acc[key].Total += product.weight_kg;
    if (product.type === EXPENSE) {
      acc[key].Pagado += product.weight_kg;
    } else if (product.type === PURCHASE) {
      acc[key].Pendiente += product.weight_kg;
    }

    return acc;
  }, {});

  const monthlyDataArray = Object.values(monthlyData); // Convert object to array

  // Agrupar datos por producto para las gráficas individuales
  const dataByProduct: Record<number, ProductMonthlyData[]> = {};

  monthlyDataArray.forEach((item) => {
    if (!dataByProduct[item.productId]) {
      dataByProduct[item.productId] = [];
    }

    // Extraer solo el mes sin el nombre del producto
    const monthOnly = item.name.split(' (')[0];

    dataByProduct[item.productId].push({
      month: monthOnly,
      Total: item.Total,
      Pagado: item.Pagado,
      Pendiente: item.Pendiente,
    });
  });

  // Ordenar los datos por mes para cada producto
  Object.keys(dataByProduct).forEach((productId) => {
    dataByProduct[parseInt(productId)].sort((a, b) => {
      const monthA = monthNames.indexOf(a.month.split(' ')[0]);
      const monthB = monthNames.indexOf(b.month.split(' ')[0]);
      return monthA - monthB;
    });
  });

  // Agrupar datos por producto, mes y día para las gráficas diarias
  const dailyDataByProduct: Record<number, Record<string, DailyData[]>> = {};

  results.forEach((product) => {
    const date = new Date(product.date);
    const monthName = formatMonthName(date);
    const dayNumber = date.getDate();
    const dayString = `Día ${dayNumber}`;

    if (!dailyDataByProduct[product.productId]) {
      dailyDataByProduct[product.productId] = {};
    }

    if (!dailyDataByProduct[product.productId][monthName]) {
      dailyDataByProduct[product.productId][monthName] = [];
    }

    // Buscar si ya existe el día en el array
    let existingDay = dailyDataByProduct[product.productId][monthName].find(d => d.day === dayString);

    if (!existingDay) {
      existingDay = {
        day: dayString,
        Total: 0,
        Pagado: 0,
        Pendiente: 0,
      };
      dailyDataByProduct[product.productId][monthName].push(existingDay);
    }

    existingDay.Total += product.weight_kg;
    if (product.type === EXPENSE) {
      existingDay.Pagado += product.weight_kg;
    } else if (product.type === PURCHASE) {
      existingDay.Pendiente += product.weight_kg;
    }
  });

  // Ordenar los días dentro de cada mes para cada producto
  Object.keys(dailyDataByProduct).forEach((productId) => {
    Object.keys(dailyDataByProduct[parseInt(productId)]).forEach((month) => {
      dailyDataByProduct[parseInt(productId)][month].sort((a, b) => {
        const dayA = parseInt(a.day.replace('Día ', ''));
        const dayB = parseInt(b.day.replace('Día ', ''));
        return dayA - dayB;
      });
    });
  });

  const totals = {
    Total: Object.values(monthlyData).reduce((acc, d) => acc + d.Total, 0),
    Pagado: Object.values(monthlyData).reduce((acc, d) => acc + d.Pagado, 0),
    Pendiente: Object.values(monthlyData).reduce((acc, d) => acc + d.Pendiente, 0),
  };

  const state = (m: MonthlyData): string => {
    if (m.Total === 0) {
      return 'Sin movimientos';
    }
    return `${((m.Pagado / m.Total) * 100).toFixed(2)}% Pagado`;
  }

  const exportToExcel = (): void => {
    const exportData = Object.values(monthlyData).map((m) => ({
      Mes: m.name,
      Total: m.Total,
      Pagado: m.Pagado,
      Pendiente: m.Pendiente,
      Estado:
        m.Pendiente === 0 && m.Total > 0
          ? 'Completo'
          : state(m),
    }));

    exportData.push({
      Mes: 'TOTAL',
      Total: totals.Total,
      Pagado: totals.Pagado,
      Pendiente: totals.Pendiente,
      Estado:
        totals.Pendiente === 0 && totals.Total > 0
          ? 'Completo'
          : `${((totals.Pagado / totals.Total) * 100).toFixed(2)}% Pagado`,
    });

    const header = [
      [`Reporte Mensual - Productos`],
      [`Período: ${filters.startDate} al ${filters.endDate}`],
      [`Generado: ${new Date().toLocaleString()}`],
      [''],
    ];

    const ws = XLSX.utils.aoa_to_sheet(header);
    XLSX.utils.sheet_add_json(ws, exportData, { origin: `A${header.length + 1}` });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pagos Mensuales');
    XLSX.writeFile(wb, `Reporte_Producto_${filters.supplierId}.xlsx`);
  };

  // Colores para gráficos
  const COLORS = ['#0088FE', '#FF8042'];
  const pieChartData = [
    { name: 'Total Pagado', value: totals.Pagado },
    { name: 'Total Pendiente', value: totals.Pendiente },
  ];
  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow flex flex-col justify-between items-center">
          <h3 className="text-sm font-medium text-gray-500">Total Pedido</h3>
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
          <h2 className="text-lg font-medium mb-4">Distribución Mensual de Pagos</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyDataArray} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip formatter={(value) => value.toLocaleString()} />
              <Legend />
              <Bar dataKey="Total" name="Total Pedido" fill="#8884d8" />
              <Bar dataKey="Pagado" name="Total Pagado" fill="#82ca9d" />
              <Bar dataKey="Pendiente" name="Pendiente" fill="#ff8042" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Panorama General de Pagos</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {pieChartData.map((data) => (
                  <Cell key={`cell-${data.name}`} fill={COLORS[pieChartData.indexOf(data) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => value.toLocaleString()} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Nueva sección: Gráficas por Producto */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Distribución Mensual de Pagos por Producto</h2>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {Object.entries(dataByProduct).map(([productId, productData]) => {
            const productName = productsMap.get(parseInt(productId)) || 'Desconocido';
            return (
              <div key={productId} className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium mb-4 text-center">{productName}</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={productData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      fontSize={12}
                    />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(value) => value.toLocaleString()} />
                    <Legend />
                    <Bar dataKey="Total" name="Total" fill="#8884d8" />
                    <Bar dataKey="Pagado" name="Pagado" fill="#82ca9d" />
                    <Bar dataKey="Pendiente" name="Pendiente" fill="#ff8042" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            );
          })}
        </div>
      </div>

      {/* Distribución Diaria por Mes para cada Producto */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Distribución Diaria por Mes y Producto</h2>
        {Object.entries(dailyDataByProduct).map(([productId, monthsData]) => {
          const productName = productsMap.get(parseInt(productId)) || 'Desconocido';
          const monthsWithData = Object.entries(monthsData);

          if (monthsWithData.length === 0) return null;

          return (
            <div key={`daily-${productId}`} className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-blue-700 border-l-4 border-blue-500 pl-3">
                {productName}
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {monthsWithData.map(([month, dailyData]) => (
                  <div key={`${productId}-${month}`} className="bg-white p-4 rounded-lg shadow border">
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
                          formatter={(value) => value.toLocaleString()}
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
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-medium">Detalle Mensual</h2>
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Exportar a Excel
          </button>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mes</th>
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
  );
};

export default ProductReport;
