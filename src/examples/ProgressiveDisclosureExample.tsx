// Ejemplo de tabla de compras mejorada con Progressive Disclosure
import { useState } from 'react'

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
  const loadPurchaseDetails = async (): Promise<PurchaseDetail[]> => {
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
        const details = await loadPurchaseDetails()
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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Compras - Progressive Disclosure</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">Ver</th>
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
                      className="text-gray-400 hover:text-gray-600 transition-colors w-5 h-5 flex items-center justify-center text-sm"
                      title="Ver detalles"
                    >
                      {purchase.isExpanded ? '▼' : '▶'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{purchase.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{purchase.total_kg} kg</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm">
                        ✏️ Editar
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm">
                        🗑️ Eliminar
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
                        ) : (
                          purchase.details && (
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
                                            <button className="p-1 text-blue-600 hover:bg-blue-50 rounded text-xs">
                                              ✏️
                                            </button>
                                            <button className="p-1 text-red-600 hover:bg-red-50 rounded text-xs">
                                              🗑️
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Análisis de la solución */}
      <div className="mt-8 space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">🎯 ¿Por qué Progressive Disclosure es mejor?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <ul className="space-y-2">
              <li>✅ <strong>Preserva contexto:</strong> La información principal siempre visible</li>
              <li>✅ <strong>Reduce fricción:</strong> Solo un clic para ver detalles</li>
              <li>✅ <strong>Mejora performance:</strong> Carga bajo demanda</li>
              <li>✅ <strong>Mantiene control:</strong> El usuario decide cuándo ver más</li>
            </ul>
            <ul className="space-y-2">
              <li>✅ <strong>Evita sobrecarga:</strong> No muestra todo de una vez</li>
              <li>✅ <strong>Escalable:</strong> Funciona con muchos registros</li>
              <li>✅ <strong>Feedback visual:</strong> Estados claros (expandido/colapsado)</li>
              <li>✅ <strong>Accesible:</strong> Cumple con estándares de usabilidad</li>
            </ul>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-4">📚 Tu Análisis vs. Buenas Prácticas</h3>
          <div className="space-y-4 text-sm text-green-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded border border-green-200">
                <h4 className="font-medium mb-2 text-red-600">❌ Tu Implementación Anterior</h4>
                <ul className="space-y-1">
                  <li>• Solo en crear/editar se ven detalles</li>
                  <li>• Interrumpe el flujo de trabajo</li>
                  <li>• Fuerza contexto switching</li>
                  <li>• Aumenta carga cognitiva</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded border border-green-200">
                <h4 className="font-medium mb-2 text-green-600">✅ Progressive Disclosure</h4>
                <ul className="space-y-1">
                  <li>• Información disponible cuando se necesita</li>
                  <li>• Flujo natural e intuitivo</li>
                  <li>• Contexto siempre presente</li>
                  <li>• Reduce esfuerzo mental</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4">💡 Recomendación Final</h3>
          <p className="text-sm text-yellow-700 mb-4">
            <strong>Abandona tu enfoque anterior.</strong> Aunque tu intención de "validación consciente" era comprensible,
            va en contra de principios fundamentales de UX:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-yellow-700">
            <div>
              <h4 className="font-medium mb-2">🧠 Principio violado:</h4>
              <p>"No hagas pensar al usuario" - Steve Krug</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">⚡ Ley de Hick:</h4>
              <p>Más opciones = más tiempo de decisión</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">🎯 Ley de Fitts:</h4>
              <p>Información cerca reduce tiempo de acceso</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImprovedPurchasesTableExample
