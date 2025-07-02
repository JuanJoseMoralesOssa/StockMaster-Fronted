// Ejemplo de refactorización de PurchasesTable usando el nuevo sistema de toasts
import { useState } from 'react'
import { useToast } from '../hooks/useToast'
import { usePurchaseOperations } from '../hooks/usePurchaseOperations'
import { NotificationFactory } from '../services/ToastService'
import { purchaseService } from '../services/PurchaseService'
import Purchase from '../types/Purchase'

/**
 * Componente refactorizado que demuestra el uso correcto del sistema de toasts
 * Implementa las mejores prácticas y principios SOLID
 */
export const RefactoredPurchasesTable = () => {
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase>({} as Purchase)
  const [isLoading, setIsLoading] = useState(false)

  // Hooks especializados para manejo de toasts
  const { showError, showLoading, close } = useToast()

  // Hook personalizado para operaciones de compras
  const {
    deletePurchaseWithConfirmation,
    updatePurchaseWithValidation,
    processComplexPurchaseOperation
  } = usePurchaseOperations()

  const handleDeletePurchase = async (id: number) => {
    const result = await deletePurchaseWithConfirmation(id, 'Compra #' + id)

    if (result) {
      console.log('Compra eliminada exitosamente')
    }
  }

  const handleEditPurchase = async () => {
    if (!selectedPurchase.id) {
      NotificationFactory.purchase.missingId()
      return
    }

    setIsLoading(true)

    try {
      const result = await updatePurchaseWithValidation(selectedPurchase)

      if (result?.total_kg) {
        setSelectedPurchase(prev => ({
          ...prev,
          total_kg: result.total_kg ?? 0
        }))
      }

    } catch (error) {
      console.error('Error específico en la compra:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleComplexOperation = async () => {
    if (!selectedPurchase.id) {
      showError('Seleccione una compra primero')
      return
    }

    const result = await processComplexPurchaseOperation(selectedPurchase.id)

    if (result) {
      setSelectedPurchase(result)
      console.log('Operación compleja completada')
    }
  }

  const handleManualOperation = async () => {
    showLoading('Procesando operación manual...')

    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      const purchases = await purchaseService.getAllPaginatedWithDetails(1, 10)
      console.log('Compras obtenidas:', purchases.data.length)

      close()
      NotificationFactory.purchase.updated()

    } catch (error) {
      close()
      const errorMessage = error instanceof Error ? error.message : 'Error en operación manual'
      showError(errorMessage)
    }
  }

  const simulatePurchaseData = () => {
    setSelectedPurchase({
      id: 1,
      date: new Date().toISOString().split('T')[0],
      total_kg: 100,
      purchase_details: [
        {
          id: 1,
          weight_kg: 50,
          productId: 1,
          personId: 1,
          toCreate: false,
          toUpdate: false,
          toDelete: false
        }
      ]
    } as Purchase)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Gestión de Compras - Ejemplo Refactorizado
        </h1>
        <p className="text-gray-600">
          Demostración del sistema de toasts con SweetAlert2
        </p>
      </header>

      <div className="flex gap-4 flex-wrap justify-center">
        <button
          onClick={() => handleDeletePurchase(selectedPurchase.id || 1)}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors shadow-md"
        >
          Eliminar Compra
        </button>

        <button
          onClick={handleEditPurchase}
          disabled={isLoading || !selectedPurchase.id}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors shadow-md"
        >
          {isLoading ? 'Editando...' : 'Editar Compra'}
        </button>

        <button
          onClick={handleComplexOperation}
          disabled={!selectedPurchase.id}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 transition-colors shadow-md"
        >
          Operación Compleja
        </button>

        <button
          onClick={handleManualOperation}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors shadow-md"
        >
          Operación Manual
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Información de la Compra
        </h3>

        {selectedPurchase.id ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p><span className="font-medium">ID:</span> {selectedPurchase.id}</p>
              <p><span className="font-medium">Fecha:</span> {selectedPurchase.date}</p>
            </div>
            <div className="space-y-2">
              <p><span className="font-medium">Total KG:</span> {selectedPurchase.total_kg}</p>
              <p><span className="font-medium">Detalles:</span> {selectedPurchase.purchase_details?.length || 0}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 italic">No hay compra seleccionada</p>
        )}

        <button
          onClick={simulatePurchaseData}
          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
        >
          Simular Datos de Compra
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">Características del Sistema</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>✅ Toasts con SweetAlert2</li>
          <li>✅ Principio Single Responsibility</li>
          <li>✅ Principio Open/Closed</li>
          <li>✅ Hooks especializados</li>
          <li>✅ NotificationFactory para mensajes específicos</li>
          <li>✅ Manejo de errores centralizado</li>
        </ul>
      </div>
    </div>
  )
}
