import { useCrudOperations, createCrudConfig } from './useCrudOperations'
import { purchaseService } from '../services/PurchaseService'
import Purchase from '../types/Purchase'

/**
 * Hook personalizado para operaciones específicas de compras.
 * Utiliza el hook genérico useCrudOperations para el manejo de la lógica CRUD
 * y se centra únicamente en las validaciones de negocio de las compras.
 */
export const usePurchaseOperations = () => {
  // 1. Definir las validaciones de negocio específicas para Compras
  const purchaseValidations = {
    create: (data: Purchase) => {
      if (!data.date) {
        throw new Error('La fecha de compra es requerida')
      }
      if (!data.purchase_details?.length) {
        throw new Error('Debe agregar al menos un detalle de compra')
      }
      for (const detail of data.purchase_details) {
        if (detail.toCreate && !detail.toDelete) {
          if (!detail.product?.id || !detail.person?.id) {
            throw new Error('Todos los detalles deben tener producto y proveedor definidos')
          }
          if (!detail.weight_kg || detail.weight_kg <= 0) {
            throw new Error('El peso debe ser mayor a cero')
          }
        }
      }
    },
    update: (data: Purchase) => {
      if (!data.id) {
        throw new Error('ID de compra requerido para actualización')
      }
      if (!data.date) {
        throw new Error('La fecha de compra es requerida')
      }
      for (const detail of data.purchase_details ?? []) {
        if (detail.toDelete) continue
        if (!detail.productId || !detail.personId) {
          throw new Error('Producto o proveedor indefinido en detalle')
        }
        if (!detail.weight_kg || detail.weight_kg <= 0) {
          throw new Error('El peso debe ser mayor a cero')
        }
      }
    },
    delete: async (id: number) => {
      // Lógica de negocio: eliminar detalles antes que la compra principal.
      // El servicio se encarga de esto, pero la validación podría estar aquí.
      await purchaseService.deleteWithDetails(id)
    }
  }

  // 2. Crear una configuración para el hook genérico
  const crudConfig = createCrudConfig<Purchase>('Compra', {
    create: purchaseService.createWithDetails,
    update: purchaseService.updateWithDetails,
    delete: purchaseService.delete,
  }, purchaseValidations)

  // 3. Usar el hook genérico con la configuración de Compra
  const { create, update, delete: deleteEntity, executeOperation, toast } = useCrudOperations<Purchase>(crudConfig)

  /**
   * Operación compleja que combina múltiples acciones.
   * Demuestra cómo usar `executeOperation` para tareas personalizadas.
   */
  const processComplexPurchaseOperation = async (purchaseId: number) => {
    return executeOperation(
      async () => {
        const purchase = await purchaseService.getById(purchaseId)
        if (!purchase) {
          throw new Error('Compra no encontrada')
        }
        // Simular operaciones complejas
        await new Promise(resolve => setTimeout(resolve, 1000))
        return await purchaseService.updateWithDetails(purchase)
      },
      'Procesando operación compleja...',
      'Operación completada exitosamente',
      'Error en la operación compleja'
    )
  }

  return {
    createPurchase: create,
    updatePurchase: update,
    deletePurchase: deleteEntity,
    processComplexPurchaseOperation,
    toast
  }
}
