// Tabla optimizada para datos pre-cargados con paginación
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
  details: PurchaseDetail[] // Ya vienen incluidos
  isExpanded?: boolean
}

export const OptimizedPurchasesTable = () => {
  // Simulamos datos que ya vienen con detalles desde el backend paginado
  const [purchases, setPurchases] = useState<Purchase[]>([
    {
      id: 1,
      date: '2025-01-15',
      total_kg: 150.5,
      details: [
        { id: 1, product: 'Café Arábica', supplier: 'Finca Los Andes', kg: 75.5 },
        { id: 2, product: 'Café Robusta', supplier: 'Hacienda Valle', kg: 75.0 },
      ]
    },
    {
      id: 2,
      date: '2025-01-14',
      total_kg: 89.2,
      details: [
        { id: 3, product: 'Café Premium', supplier: 'Cooperativa Sur', kg: 89.2 },
      ]
    },
    {
      id: 3,
      date: '2025-01-13',
      total_kg: 203.8,
      details: [
        { id: 4, product: 'Café Especial', supplier: 'Finca Norte', kg: 100.0 },
        { id: 5, product: 'Café Orgánico', supplier: 'EcoFinca', kg: 103.8 },
      ]
    },
  ])

  const [viewMode, setViewMode] = useState<'compact' | 'expanded'>('compact')

  const togglePurchaseExpansion = (purchaseId: number) => {
    setPurchases(prev => prev.map(purchase =>
      purchase.id === purchaseId
        ? { ...purchase, isExpanded: !purchase.isExpanded }
        : purchase
    ))
  }

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'compact' ? 'expanded' : 'compact')
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Compras - Datos Pre-cargados</h1>

        {/* Toggle para cambiar vista */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleViewMode}
            className={`px-4 py-2 rounded-lg transition-colors ${viewMode === 'compact'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            {viewMode === 'compact' ? '📋 Vista Compacta' : '📖 Vista Expandida'}
          </button>

          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            + Nueva Compra
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {viewMode === 'compact' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">Ver</th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total KG</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {viewMode === 'expanded' ? 'Productos' : 'Items'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {purchases.map((purchase) => (
              <>
                {/* Fila principal */}
                <tr key={purchase.id} className="hover:bg-gray-50">
                  {viewMode === 'compact' && (
                    <td className="px-6 py-4">
                      <button
                        onClick={() => togglePurchaseExpansion(purchase.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors w-5 h-5 flex items-center justify-center text-sm"
                        title="Ver detalles"
                      >
                        {purchase.isExpanded ? '▼' : '▶'}
                      </button>
                    </td>
                  )}

                  <td className="px-6 py-4 text-sm text-gray-900">{purchase.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{purchase.total_kg} kg</td>

                  <td className="px-6 py-4 text-sm text-gray-900">
                    {viewMode === 'expanded' ? (
                      // Vista expandida: muestra productos directamente
                      <div className="space-y-1">
                        {purchase.details.map(detail => (
                          <div key={detail.id} className="text-xs text-gray-600">
                            {detail.product} ({detail.kg}kg)
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Vista compacta: solo cuenta
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {purchase.details.length} productos
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-xs">
                        ✏️
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-xs">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Fila expandible - solo en modo compacto */}
                {viewMode === 'compact' && purchase.isExpanded && (
                  <tr>
                    <td colSpan={5} className="px-0 py-0">
                      <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
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
                                      <button className="p-1 text-blue-600 hover:bg-blue-50 rounded text-xs">✏️</button>
                                      <button className="p-1 text-red-600 hover:bg-red-50 rounded text-xs">🗑️</button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Análisis de la solución optimizada */}
      <div className="mt-8 space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">🎯 Solución Optimizada para Datos Pre-cargados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <ul className="space-y-2">
              <li>✅ <strong>Dual View Mode:</strong> Compacta vs. Expandida según necesidad</li>
              <li>✅ <strong>Zero Loading:</strong> No hay llamadas adicionales</li>
              <li>✅ <strong>Flexibilidad de Contexto:</strong> El usuario elige cómo ver</li>
              <li>✅ <strong>Performance Óptima:</strong> Aprovecha datos pre-cargados</li>
            </ul>
            <ul className="space-y-2">
              <li>✅ <strong>Vista Compacta:</strong> Para navegación rápida</li>
              <li>✅ <strong>Vista Expandida:</strong> Para trabajo con detalles</li>
              <li>✅ <strong>Toggle Global:</strong> Cambia toda la vista de una vez</li>
              <li>✅ <strong>Progressive Enhancement:</strong> Funciona en ambos modos</li>
            </ul>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-4">💡 ¿Por qué esta solución es mejor para tu caso?</h3>
          <div className="space-y-4 text-sm text-green-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded border border-green-200">
                <h4 className="font-medium mb-2 text-green-600">🚀 Ventajas en tu contexto:</h4>
                <ul className="space-y-1">
                  <li>• Aprovecha que datos ya están cargados</li>
                  <li>• No requiere llamadas API adicionales</li>
                  <li>• Respeta tu arquitectura de paginación</li>
                  <li>• Máximo rendimiento con mínima complejidad</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded border border-green-200">
                <h4 className="font-medium mb-2 text-blue-600">🎨 Flexibilidad UX:</h4>
                <ul className="space-y-1">
                  <li>• Modo compacto para escaneo rápido</li>
                  <li>• Modo expandido para trabajo detallado</li>
                  <li>• Usuario controla el nivel de detalle</li>
                  <li>• Transición suave entre modos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-orange-800 mb-4">📊 Recomendación Final Actualizada</h3>
          <div className="text-sm text-orange-700 space-y-3">
            <p><strong>Tienes razón sobre los datos pre-cargados.</strong> Mi recomendación anterior no consideró tu arquitectura.</p>

            <div className="bg-white p-4 rounded border border-orange-200">
              <h4 className="font-medium mb-2">🎯 Estrategia Recomendada:</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li><strong>Vista por defecto:</strong> Compacta con toggle para expandir</li>
                <li><strong>Preferencia de usuario:</strong> Recordar último modo usado</li>
                <li><strong>Responsive:</strong> Automático en móvil = compacta, desktop = elección</li>
                <li><strong>Contexto-aware:</strong> Expandir automáticamente al editar</li>
              </ol>
            </div>

            <p className="font-medium">
              🎉 Tu instinto sobre los datos pre-cargados era correcto. Esta solución respeta tu arquitectura
              mientras mejora significativamente la UX.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OptimizedPurchasesTable
