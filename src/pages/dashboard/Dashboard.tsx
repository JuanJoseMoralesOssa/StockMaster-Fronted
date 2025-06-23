import { useState, useEffect } from 'react';
import Person from '../../types/Person';
import { useAvailableSuppliers } from '../../hooks/useAvailableSuppliers';
import { useAvailableProducts } from '../../hooks/useAvailableProducts';
import Filters from './Filters';
import SupplierProductCharts from './SupplierProductCharts';
import SupplierCharts from './SupplierCharts';
import ProductChart from './ProductChart';

interface SupplierProductsResultsProps {
  date: string;
  weight_kg: number;
  type: 'Compra' | 'Gasto';
}

interface SuppliersResultsProps extends SupplierProductsResultsProps {
  personId: number;
}

interface ProductsResultsProps extends SupplierProductsResultsProps {
  productId: number;
}

export default function SupplierPaymentReport() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [supplierProductResults, setSupplierProductResults] = useState<SupplierProductsResultsProps[]>([]);
  const [suppliersResults, setSuppliersResults] = useState<SuppliersResultsProps[]>([]);
  const [productsResults, setProductsResults] = useState<ProductsResultsProps[]>([]);
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
        const mockData: any[] = [
          {
            "date": "2025-04-17T20:18:40.000Z",
            "weight_kg": 21,
            "type": "Compra"
          },
          {
            "date": "2025-04-17T20:23:52.000Z",
            "weight_kg": 12,
            "type": "Compra"
          },
          {
            "date": "2025-04-17T20:23:52.000Z",
            "weight_kg": 21,
            "type": "Compra"
          },
          {
            "date": "2025-04-17T20:23:52.000Z",
            "weight_kg": 21,
            "type": "Compra"
          },
          {
            "date": "2025-04-17T20:59:12.000Z",
            "weight_kg": 1,
            "type": "Compra"
          },
          {
            "date": "2025-04-17T20:59:12.000Z",
            "weight_kg": 1,
            "type": "Compra"
          },
          {
            "date": "2025-04-17T21:05:20.000Z",
            "weight_kg": 10,
            "type": "Gasto"
          },
          {
            "date": "2025-04-17T21:10:07.000Z",
            "weight_kg": 12,
            "type": "Gasto"
          },
          {
            "date": "2025-04-17T22:26:05.000Z",
            "weight_kg": 90,
            "type": "Compra"
          },
          {
            "date": "2025-05-17T21:10:07.000Z",
            "weight_kg": 12,
            "type": "Gasto"
          },
          {
            "date": "2025-05-17T22:26:05.000Z",
            "weight_kg": 90,
            "type": "Compra"
          },
          {
            "date": "2025-06-17T21:10:07.000Z",
            "weight_kg": 12,
            "type": "Gasto"
          },
          {
            "date": "2025-06-17T22:26:05.000Z",
            "weight_kg": 90,
            "type": "Compra"
          },
          {
            "date": "2025-06-18T21:10:07.000Z",
            "weight_kg": 12,
            "type": "Gasto"
          },
          {
            "date": "2025-06-18T22:26:05.000Z",
            "weight_kg": 90,
            "type": "Compra"
          },
          {
            "date": "2025-06-18T21:10:07.000Z",
            "weight_kg": 12,
            "type": "Gasto"
          },
          {
            "date": "2025-06-18T22:26:05.000Z",
            "weight_kg": 90,
            "type": "Compra"
          },
          {
            "date": "2025-06-19T21:10:07.000Z",
            "weight_kg": 12,
            "type": "Gasto"
          },
          {
            "date": "2025-06-19T22:26:05.000Z",
            "weight_kg": 90,
            "type": "Compra"
          },
          {
            "date": "2025-06-20T21:10:07.000Z",
            "weight_kg": 12,
            "type": "Gasto"
          },
          {
            "date": "2025-06-20T22:26:05.000Z",
            "weight_kg": 90,
            "type": "Compra"
          },
          {
            "date": "2025-06-21T21:10:07.000Z",
            "weight_kg": 12,
            "type": "Gasto"
          },
          {
            "date": "2025-06-21T22:26:05.000Z",
            "weight_kg": 90,
            "type": "Compra"
          },
          {
            "date": "2025-06-22T21:10:07.000Z",
            "weight_kg": 12,
            "type": "Gasto"
          },
          {
            "date": "2025-06-22T22:26:05.000Z",
            "weight_kg": 90,
            "type": "Compra"
          },
          {
            "date": "2025-06-23T21:10:07.000Z",
            "weight_kg": 12,
            "type": "Gasto"
          },
          {
            "date": "2025-06-23T22:26:05.000Z",
            "weight_kg": 90,
            "type": "Compra"
          },
          {
            "date": "2025-06-24T21:10:07.000Z",
            "weight_kg": 12,
            "type": "Gasto"
          },
          {
            "date": "2025-06-24T22:26:05.000Z",
            "weight_kg": 90,
            "type": "Compra"
          },
          {
            "date": "2025-06-25T21:10:07.000Z",
            "weight_kg": 12,
            "type": "Gasto"
          },
          {
            "date": "2025-06-25T22:26:05.000Z",
            "weight_kg": 90,
            "type": "Compra"
          },
          {
            "date": "2025-06-26T21:10:07.000Z",
            "weight_kg": 12,
            "type": "Gasto"
          },
          {
            "date": "2025-06-26T22:26:05.000Z",
            "weight_kg": 90,
            "type": "Compra"
          },
          {
            "date": "2025-06-27T21:10:07.000Z",
            "weight_kg": 12,
            "type": "Gasto"
          },
          {
            "date": "2025-06-27T22:26:05.000Z",
            "weight_kg": 90,
            "type": "Compra"
          }
        ]

        // Simulación de datos para proveedores
        const suppliersMockData: any[] = [
          {
            "personId": 1,
            "date": "2025-04-17T20:18:40.000Z",
            "weight_kg": 21,
            "type": "Compra"
          },
          {
            "personId": 2,
            "date": "2025-04-17T20:23:52.000Z",
            "weight_kg": 12,
            "type": "Compra"
          },
          {
            "personId": 3,
            "date": "2025-04-17T20:23:52.000Z",
            "weight_kg": 21,
            "type": "Compra"
          },
          {
            "personId": 4,
            "date": "2025-04-17T20:23:52.000Z",
            "weight_kg": 21,
            "type": "Compra"
          },
          {
            "personId": 5,
            "date": "2025-04-17T20:59:12.000Z",
            "weight_kg": 1,
            "type": "Compra"
          },
          {
            "personId": 6,
            "date": "2025-04-17T20:59:12.000Z",
            "weight_kg": 1,
            "type": "Compra"
          },
          {
            "personId": 7,
            "date": "2025-04-17T21:05:20.000Z",
            "weight_kg": 10,
            "type": "Gasto"
          },
          {
            "personId": 8,
            "date": "2025-04-17T21:10:07.000Z",
            "weight_kg": 12,
            "type": "Gasto"
          },
        ]

        // Simulación de datos para productos
        const productsMockData: any[] = [
          {
            productId: 1,
            date: '2025-04-17T20:18:40.000Z',
            weight_kg: 21,
            type: 'Compra',
          },
          {
            productId: 2,
            date: '2025-04-17T20:23:52.000Z',
            weight_kg: 12,
            type: 'Compra',
          },
          {
            productId: 3,
            date: '2025-04-17T20:23:52.000Z',
            weight_kg: 21,
            type: 'Compra',
          },
          {
            productId: 4,
            date: '2025-04-17T20:23:52.000Z',
            weight_kg: 21,
            type: 'Compra',
          },
          {
            productId: 1,
            date: '2025-04-20T10:15:30.000Z',
            weight_kg: 15,
            type: 'Gasto',
          },
          {
            productId: 2,
            date: '2025-04-21T09:30:00.000Z',
            weight_kg: 10,
            type: 'Gasto',
          },
          {
            productId: 3,
            date: '2025-04-22T14:45:20.000Z',
            weight_kg: 10,
            type: 'Gasto',
          },

          {
            productId: 1,
            date: '2025-03-17T20:23:52.000Z',
            weight_kg: 22,
            type: 'Compra',
          },
          {
            productId: 1,
            date: '2025-03-17T10:15:30.000Z',
            weight_kg: 12,
            type: 'Gasto',
          },
          {
            productId: 1,
            date: '2025-02-17T20:23:52.000Z',
            weight_kg: 22,
            type: 'Compra',
          },
          {
            productId: 1,
            date: '2025-02-17T10:15:30.000Z',
            weight_kg: 12,
            type: 'Gasto',
          },

          {
            productId: 1,
            date: '2025-01-17T20:23:52.000Z',
            weight_kg: 22,
            type: 'Compra',
          },
          {
            productId: 1,
            date: '2025-01-17T10:15:30.000Z',
            weight_kg: 12,
            type: 'Gasto',
          },
        ]



        setSupplierProductResults(mockData);
        setSuppliersResults(suppliersMockData);
        setProductsResults(productsMockData);
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
                {
                  ...filters,
                  startDate:
                    date.getFullYear() + '-' +
                    (date.getMonth() + 1).toString().padStart(2, '0') + '-' +
                    '01',
                  endDate:
                    date.getFullYear() + '-' +
                    (date.getMonth() + 1).toString().padStart(2, '0') + '-' +
                    date.getDate().toString().padStart(2, '0'),
                  supplierId: '', productId: ''
                }
              )
              setSelectedFilter('all')
            }}
            className='px-4 py-2 rounded-2xl w-full md:w-fit text-white bg-blue-600 hover:text-gray-50 hover:bg-blue-700'>
            Limpiar Filtros
          </button>

        </div>
      </div>

      <Filters
        filters={filters}
        setFilters={setFilters}
        products={products}
        availableSuppliers={availableSuppliers}
        selectedFilter={selectedFilter}
        setSelectedFilter={(filter: string) => setSelectedFilter(filter as 'all' | 'withDebt' | 'fullyPaid')}
      />      {
        filters.supplierId &&
        filters.productId &&
        supplierProductResults.length > 0 &&
        (
          <SupplierProductCharts
            results={supplierProductResults}
            supplier={availableSuppliers.find(s => s.id === Number(filters.supplierId)) ?? {} as Person}
            product={products.find(p => p.id === Number(filters.productId)) ?? { id: 0, name: 'Unknown Product' }}
            filters={filters}
            selectedFilter={selectedFilter}
          />
        )
      }
      {
        filters.supplierId &&
        !filters.productId &&
        (
          <SupplierCharts
            selectedFilter={selectedFilter}
            results={productsResults}
            products={products}
            filters={filters}
          />
        )
      }
      {
        !filters.supplierId &&
        filters.productId &&
        (
          <ProductChart
            selectedFilter="all"
            results={suppliersResults}
            suppliers={availableSuppliers}
            filters={{
              startDate: "2025-04-01",
              endDate: "2025-04-30",
              supplierId: "",
              productId: ""
            }}
          />
        )
      }

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
