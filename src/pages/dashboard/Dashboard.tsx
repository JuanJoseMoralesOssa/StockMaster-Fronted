import { useState } from 'react';
import { useAvailableSuppliers } from '../../hooks/useAvailableSuppliers';
import { useAvailableProducts } from '../../hooks/useAvailableProducts';
import Filters from './Filters';
import { dashboardService } from '../../services/DashboardService';
import { DashboardResult, ProductsResults, SuppliersResults } from '../../types/DashboardResults';
import ModeToggleDashboard from './ModeToggle';
import RenderingWithMode from './RenderingWithMode';

type DashboardMode = 'detailed' | 'general';

export default function SupplierPaymentReport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardMode, setDashboardMode] = useState<DashboardMode>('detailed');

  const [supplierProductResults, setSupplierProductResults] = useState<DashboardResult[]>([]);
  const [suppliersResults, setSuppliersResults] = useState<SuppliersResults[]>([]);
  const [productsResults, setProductsResults] = useState<ProductsResults[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'withDebt' | 'fullyPaid'>('all');
  const date = new Date()
  const [filters, setFilters] = useState({
    startDate:
      date.getFullYear() + '-' +
      (date.getMonth() + 1).toString().padStart(2, '0') + '-' +
      // date.getDate().toString().padStart(2, '0'),
      '01',
    endDate:
      date.getFullYear() + '-' +
      (date.getMonth() + 1).toString().padStart(2, '0') + '-' +
      date.getDate().toString().padStart(2, '0'),
    supplierId: '',
    productId: '',
  });
  const {
    products,
  } = useAvailableProducts()
  const {
    suppliers,
  } = useAvailableSuppliers()


  // Colores para los gráficos
  // const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a83232', '#8884d8'];

  const handleModeChange = (newMode: DashboardMode) => {
    setDashboardMode(newMode);
    // Limpiar resultados al cambiar de modo para evitar confusión
    setSupplierProductResults([]);
    setSuppliersResults([]);
    setProductsResults([]);
    setError(null);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Limpiar arrays antes de cargar nuevos datos
      setSupplierProductResults([]);
      setSuppliersResults([]);
      setProductsResults([]);
      if (!filters.startDate || !filters.endDate) {
        setError('Por favor, selecciona un rango de fechas válido.');
        setLoading(false);
        return;
      }
      if (filters.startDate > filters.endDate) {
        setError('La fecha de inicio no puede ser posterior a la fecha de fin.');
        setLoading(false);
        return;
      }
      if (filters.supplierId && isNaN(Number(filters.supplierId))) {
        setError('Por favor, selecciona un proveedor válido.');
        setLoading(false);
        return;
      }
      if (filters.productId && isNaN(Number(filters.productId))) {
        setError('Por favor, selecciona un producto válido.');
        setLoading(false);
        return;
      }
      if (filters.supplierId && filters.productId) {
        await dashboardService.getPersonProductTransactions(
          Number(filters.supplierId),
          Number(filters.productId),
          filters.startDate,
          filters.endDate
        ).then((data) => {
          setSupplierProductResults([...data]);
        }).catch((err) => {
          console.error('Error fetching person product transactions:', err)
          setError('Error al cargar los datos de transacciones de proveedor y producto')
        });
      }
      if (filters.supplierId && !filters.productId) {
        await dashboardService.getPersonTransactions(
          Number(filters.supplierId),
          filters.startDate,
          filters.endDate
        ).then((data) => {
          setProductsResults([...data]);
        }).catch((err) => {
          console.error('Error fetching person transactions:', err)
          setError('Error al cargar los datos de transacciones de proveedor')
        });
      }
      if (!filters.supplierId && filters.productId) {
        await dashboardService.getProductTransactions(
          Number(filters.productId),
          filters.startDate,
          filters.endDate
        ).then((data) => {
          setSuppliersResults([...data]);
        }).catch((err) => {
          console.error('Error fetching product transactions:', err)
          setError('Error al cargar los datos de transacciones de producto')
        });
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching supplier payment data:', err);
      setError('Error al cargar los datos de pagos');
      setLoading(false);
    }
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
    <div className="p-6 bg-gray-50 min-h-screen w-full">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Reporte de Pagos a Proveedores</h1>

      <ModeToggleDashboard
        dashboardMode={dashboardMode}
        handleModeChange={handleModeChange}
      />

      <div className='flex flex-col gap-2'>
        <div className='flex flex-col md:flex-row self-end gap-2 md:gap-4 w-full md:w-fit'>
          <button
            onClick={fetchData}
            className={`px-4 py-2 rounded-2xl w-full md:w-fit text-white transition-colors ${dashboardMode === 'detailed'
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-green-600 hover:bg-green-700'
              }`}>
            {dashboardMode === 'detailed' ? '🔍 Buscar Detallado' : '⚡ Buscar General'}
          </button>
          <button
            onClick={() => {
              setFilters(
                {
                  startDate:
                    date.getFullYear() + '-' +
                    (date.getMonth() + 1).toString().padStart(2, '0') + '-' +
                    '01',
                  endDate:
                    date.getFullYear() + '-' +
                    (date.getMonth() + 1).toString().padStart(2, '0') + '-' +
                    date.getDate().toString().padStart(2, '0'),
                  supplierId: '',
                  productId: ''
                }
              )
              setSelectedFilter('all')
              setProductsResults([])
              setSuppliersResults([])
              setSupplierProductResults([])
            }}
            className='px-4 py-2 rounded-2xl w-full md:w-fit text-white bg-blue-600 hover:text-gray-50 hover:bg-blue-700'>
            🧹 Limpiar Filtros
          </button>
        </div>
        <Filters
          filters={filters}
          setFilters={setFilters}
          products={products}
          suppliers={suppliers}
          selectedFilter={selectedFilter}
          setSelectedFilter={(filter: string) => setSelectedFilter(filter as 'all' | 'withDebt' | 'fullyPaid')}
        />
      </div>

      <RenderingWithMode
        dashboardMode={dashboardMode}
        filters={filters}
        products={products}
        suppliers={suppliers}
        suppliersResults={suppliersResults}
        productsResults={productsResults}
        supplierProductResults={supplierProductResults}
        selectedFilter={selectedFilter}
      />

      {
        !filters.startDate &&
        !filters.endDate &&
        !filters.supplierId &&
        !filters.productId &&
        (
          <div className="flex justify-center items-center h-64">
            <div className="text-xl font-semibold text-gray-600">Por favor, selecciona filtros para ver los resultados.</div>
          </div>
        )
      }
    </div >
  );
}
