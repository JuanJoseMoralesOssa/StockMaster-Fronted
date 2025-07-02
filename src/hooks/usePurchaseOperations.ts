import { useCrudToast, useToast } from './useToast'
import { purchaseService } from '../services/PurchaseService'
import Purchase from '../types/Purchase'

/**
 * Hook personalizado para operaciones específicas de compras
 * Implementa validaciones de negocio y manejo de toasts específicos
 */
export const usePurchaseOperations = () => {
  const { handleCreate, handleUpdate, handleDelete } = useCrudToast()
  const { showLoading, close, showError } = useToast()

  /**
   * Crea una compra con validaciones específicas del dominio
   */
  const createPurchaseWithDetails = async (purchaseData: Purchase) => {
    return await handleCreate(async () => {
      // Validaciones específicas del negocio
      if (!purchaseData.date) {
        throw new Error('La fecha de compra es requerida')
      }

      if (!purchaseData.purchase_details?.length) {
        throw new Error('Debe agregar al menos un detalle de compra')
      }

      // Validar que todos los detalles tengan producto y persona
      for (const detail of purchaseData.purchase_details) {
        if (detail.toCreate && !detail.toDelete) {
          if (!detail.product?.id || !detail.person?.id) {
            throw new Error('Todos los detalles deben tener producto y proveedor definidos')
          }
          if (!detail.weight_kg || detail.weight_kg <= 0) {
            throw new Error('El peso debe ser mayor a cero')
          }
        }
      }

      return await purchaseService.createWithDetails(purchaseData)
    }, 'Compra')
  }

  /**
   * Actualiza una compra con validación avanzada
   */
  const updatePurchaseWithValidation = async (purchaseData: Purchase) => {
    // Loading personalizado para operaciones complejas
    showLoading('Validando y actualizando compra...')

    try {
      // Validaciones de negocio específicas
      if (!purchaseData.id) {
        throw new Error('ID de compra requerido para actualización')
      }

      if (!purchaseData.date) {
        throw new Error('La fecha de compra es requerida')
      }

      // Validar detalles
      for (const detail of purchaseData.purchase_details ?? []) {
        if (detail.toDelete) continue // Saltar validación para elementos a eliminar

        if (!detail.productId || !detail.personId) {
          throw new Error('Producto o proveedor indefinido en detalle')
        }

        if (!detail.weight_kg || detail.weight_kg <= 0) {
          throw new Error('El peso debe ser mayor a cero')
        }
      }

      close() // Cerrar loading de validación

      // Usar el sistema de toast para la actualización
      return await handleUpdate(async () => {
        return await purchaseService.updateWithDetails(purchaseData)
      }, 'Compra')

    } catch (error) {
      close()
      const message = error instanceof Error ? error.message : 'Error en validación'
      showError(message)
      return null
    }
  }

  /**
   * Elimina una compra con confirmación personalizada
   */
  const deletePurchaseWithConfirmation = async (id: number, purchaseName?: string) => {
    const confirmMessage = purchaseName
      ? `¿Eliminar la compra "${purchaseName}"? Esta acción no se puede deshacer.`
      : '¿Estás seguro de que quieres eliminar esta compra? Esta acción eliminará también todos sus detalles.'

    return await handleDelete(async () => {
      // Primero eliminar detalles, luego la compra principal
      await purchaseService.deleteWithDetails(id)
      await purchaseService.delete(id)
      return true
    }, 'Compra', confirmMessage)
  }

  /**
   * Operación compleja que combina múltiples acciones
   */
  const processComplexPurchaseOperation = async (purchaseId: number) => {
    showLoading('Procesando operación compleja...')

    try {
      // Obtener datos actualizados
      const purchase = await purchaseService.getById(purchaseId)

      if (!purchase) {
        throw new Error('Compra no encontrada')
      }

      // Simular operaciones complejas
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Recalcular totales u otras operaciones
      const updatedPurchase = await purchaseService.updateWithDetails(purchase)

      close()
      return updatedPurchase

    } catch (error) {
      close()
      const message = error instanceof Error ? error.message : 'Error en operación compleja'
      showError(message)
      return null
    }
  }

  return {
    createPurchaseWithDetails,
    updatePurchaseWithValidation,
    deletePurchaseWithConfirmation,
    processComplexPurchaseOperation,
  }
}
