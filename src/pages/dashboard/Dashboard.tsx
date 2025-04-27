import { useState, useEffect } from 'react';
import Person from '../../types/Person';
import { useAvailableSuppliers } from '../../hooks/useAvailableSuppliers';
import { useAvailableProducts } from '../../hooks/useAvailableProducts';
import Filters from './Filters';
import SupplierAndProduct from './SupplierAndProduct';

export default function SupplierPaymentReport() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [suppliers, setSuppliers] = useState<Person[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    supplierId: '',
    productId: '',
  });

  const {
    products,
    // loading: productsLoading,
    // error: productsError,
    // refreshProducts,
  } = useAvailableProducts()

  const {
    suppliers: availableSuppliers,
    // loading: suppliersLoading,
    // error: suppliersError,
    // refreshSuppliers,
  } = useAvailableSuppliers()


  // Colores para los gráficos
  // const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a83232', '#8884d8'];

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
        console.error('Error fetching supplier payment data:', err);
        setError('Error al cargar los datos de pagos');
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

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
      <div className='flex flex-col md:flex-row justify-between items-center'>

        <h1 className="text-2xl font-bold text-gray-800 mb-6">Reporte de Pagos a Proveedores</h1>
        <div className='flex flex-col md:flex-row gap-2 md:gap-4 w-full md:w-fit'>
          <button
            onClick={() => setFilters(
              { ...filters, startDate: filters.startDate, endDate: filters.endDate, supplierId: filters.supplierId, productId: filters.productId }
            )}
            className='px-4 py-2 rounded-2xl w-full md:w-fit text-white bg-blue-600 hover:text-gray-50 hover:bg-blue-700'>
            Buscar
          </button>
          <button
            onClick={() => {
              setFilters(
                { ...filters, startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], supplierId: '', productId: '' }
              )
              setSelectedFilter('all')
            }}
            className='px-4 py-2 rounded-2xl w-full md:w-fit text-white bg-blue-600 hover:text-gray-50 hover:bg-blue-700'>
            Limpiar Filtros
          </button>

        </div>
      </div>

      <Filters
        availableSuppliers={availableSuppliers}
        filters={filters}
        products={products}
        setFilters={setFilters}
        setSelectedFilter={setSelectedFilter}
        selectedFilter={selectedFilter}
      />

      <SupplierAndProduct
        suppliers={suppliers}
        filters={filters}
        selectedFilter={selectedFilter}
      />


    </div>
  );
}
