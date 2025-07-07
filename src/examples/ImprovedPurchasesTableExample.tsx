// Ejemplo de tabla de compras mejorada con Progressive Disclosure
import { useState } from 'react'
// Usamos símbolos simples en lugar de heroicons para simplicidad
const ChevronDownIcon = () => <span>▼</span>
const ChevronRightIcon = () => <span>▶</span>
const PlusIcon = () => <span>+</span>
const PencilIcon = () => <span>✏️</span>
const TrashIcon = () => <span>🗑️</span>

interface PurchaseDetail {
  id: number
  product: string
  supplier: string
  kg: number
}

interface Purchase {
  id: number
  date: string
  total_kg: number
  details?: PurchaseDetail[] // Lazy loaded
  isExpanded?: boolean
  isLoadingDetails?: boolean
}

export const ImprovedPurchasesTableExample = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([
    { id: 1, date: '2025-01-15', total_kg: 150.5 },
    { id: 2, date: '2025-01-14', total_kg: 89.2 },
    { id: 3, date: '2025-01-13', total_kg: 203.8 },
  ])

  // Simula carga de detalles
  const loadPurchaseDetails = async (purchaseId: number): Promise<PurchaseDetail[]> => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          { id: 1, product: 'Café Arábica', supplier: 'Finca Los Andes', kg: 75.5 },
          { id: 2, product: 'Café Robusta', supplier: 'Hacienda Valle', kg: 75.0 },
        ])
      }, 800)
    })
  }

  const togglePurchaseExpansion = async (purchaseId: number) => {
    setPurchases(prev => prev.map(purchase => {
      if (purchase.id === purchaseId) {
        if (!purchase.isExpanded) {
          // Expandir y cargar detalles si no existen
          if (!purchase.details) {
            return { ...purchase, isExpanded: true, isLoadingDetails: true }
          }
          return { ...purchase, isExpanded: true }
        } else {
          // Colapsar
          return { ...purchase, isExpanded: false }
        }
      }
      return purchase
    }))

    // Cargar detalles si es necesario
    const purchase = purchases.find(p => p.id === purchaseId)
    if (purchase && !purchase.details) {
      try {
        const details = await loadPurchaseDetails(purchaseId)
        setPurchases(prev => prev.map(p =>
          p.id === purchaseId
            ? { ...p, details, isLoadingDetails: false }
            : p
        ))
      } catch (error) {
        console.error('Error loading details:', error)
        setPurchases(prev => prev.map(p =>
          p.id === purchaseId
            ? { ...p, isLoadingDetails: false, isExpanded: false }
            : p
        ))
      }
    }
  }

  const handleCreate = () => {
    console.log('Crear nueva compra')
  }

  const handleEdit = (purchase: Purchase) => {
    console.log('Editar compra:', purchase.id)
  }

  const handleDelete = (purchaseId: number) => {
    console.log('Eliminar compra:', purchaseId)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Compras</h1>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Nueva Compra
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12"></th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total KG</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {purchases.map((purchase) => (
              <>
                {/* Fila principal de la compra */}
                <tr key={purchase.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <button
                      onClick={() => togglePurchaseExpansion(purchase.id)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Ver detalles"
                    >
                      {purchase.isExpanded ? (
                        <ChevronDownIcon className="w-5 h-5" />
                      ) : (
                        <ChevronRightIcon className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{purchase.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{purchase.total_kg} kg</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(purchase)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar compra"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(purchase.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar compra"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Fila expandible con detalles */}
                {purchase.isExpanded && (
                  <tr>
                    <td colSpan={4} className="px-0 py-0">
                      <div className="bg-gray-50 border-t border-gray-200">
                        {purchase.isLoadingDetails ? (
                          <div className="px-6 py-8 text-center">
                            <div className="inline-flex items-center gap-2 text-gray-500">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              Cargando detalles...
                            </div>
                          </div>
                        ) : purchase.details ? (
                          <div className="px-6 py-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Detalles de la Compra</h4>
                            <div className="bg-white rounded border border-gray-200 overflow-hidden">
                              <table className="w-full text-sm">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="px-4 py-2 text-left font-medium text-gray-700">Producto</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-700">Proveedor</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-700">KG</th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-700">Acciones</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {purchase.details.map((detail) => (
                                    <tr key={detail.id} className="hover:bg-gray-50">
                                      <td className="px-4 py-2 text-gray-900">{detail.product}</td>
                                      <td className="px-4 py-2 text-gray-900">{detail.supplier}</td>
                                      <td className="px-4 py-2 text-gray-900">{detail.kg} kg</td>
                                      <td className="px-4 py-2">
                                        <div className="flex items-center gap-1">
                                          <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                                            <PencilIcon className="w-3 h-3" />
                                          </button>
                                          <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                                            <TrashIcon className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Información sobre las mejores prácticas implementadas */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">🎯 Mejores Prácticas Implementadas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
          <ul className="space-y-2">
            <li>✅ <strong>Progressive Disclosure:</strong> Los detalles se muestran bajo demanda</li>
            <li>✅ <strong>Lazy Loading:</strong> Los detalles se cargan solo cuando se necesitan</li>
            <li>✅ <strong>Visual Feedback:</strong> Indicadores claros de estado (cargando, expandido)</li>
            <li>✅ <strong>Contexto Preservado:</strong> La información principal siempre visible</li>
          </ul>
          <ul className="space-y-2">
            <li>✅ <strong>Affordances Claras:</strong> Iconos que indican acciones posibles</li>
            <li>✅ <strong>Reducción de Fricción:</strong> Un solo clic para ver detalles</li>
            <li>✅ <strong>Performance Optimizada:</strong> Datos bajo demanda</li>
            <li>✅ <strong>Escalabilidad:</strong> Funciona con muchos registros</li>
          </ul>
        </div>
      </div>

      {/* Información sobre los principios de UX aplicados */}
      <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-800 mb-4">📚 Principios de UX Aplicados</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
          <div>
            <h4 className="font-medium mb-2">🧠 Ley de Miller (7±2):</h4>
            <p>Limitamos la información inicial para evitar sobrecarga cognitiva</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">👁️ Gestalt - Proximidad:</h4>
            <p>Los detalles están visualmente agrupados con su compra principal</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">🎯 Ley de Fitts:</h4>
            <p>Botones de acción de tamaño adecuado y bien espaciados</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">⚡ Ley de Hick:</h4>
            <p>Acciones progresivas - primero ver, luego decidir qué hacer</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImprovedPurchasesTableExample
