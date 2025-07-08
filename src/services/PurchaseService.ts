import axios from 'axios'
import Purchase from '../types/Purchase'
import { PaginatedResponse } from '../types/PaginatedResponse'
import { ApiService } from './ApiService'
import { purchaseDetailsService } from './PurchaseDetailsService'

/**
 * Servicio para manejar creación y actualización de compras con detalles
 * Respecta los flags toCreate, toUpdate y toDelete en cada detalle
 */
export class PurchaseService extends ApiService<Purchase> {
  constructor() {
    super('purchases')
  }

  /**
   * Crea una compra y luego sus detalles marcados con toCreate = true
   */
  async createWithDetails(purchase: Purchase): Promise<Purchase> {
    if (!purchase.purchase_details) {
      return this.create(purchase)
    }

    // Calcular total_kg solo de los detalles a crear
    purchase.total_kg = purchase.purchase_details
      .reduce((sum, d) => sum + (d.weight_kg ?? 0), 0)

    // Crear compra principal
    const toCreatePurchase = { ...purchase }
    delete toCreatePurchase.purchase_details
    const created = await this.create(toCreatePurchase)

    if (!created.id) {
      throw new Error('Error al crear la compra principal')
    }

    // Crear detalles nuevos
    for (const det of purchase.purchase_details) {
      if (det.toCreate && !det.toDelete) {
        if (!det.product?.id || !det.person?.id) {
          throw new Error('Producto o persona indefinida en detalle a crear')
        }
        const payload = {
          weight_kg: det.weight_kg,
          productId: det.product.id,
          personId: det.person.id,
        }
        await axios.post(`${this.getUrl()}/${created.id}/purchase-details`, payload)
      }
    }
    const purchaseDetails = await axios.get(`${this.getUrl()}/${created.id}/purchase-details`)
      .then(res => res.data)
    return { ...created, purchase_details: purchaseDetails }
  }

  /**
   * Actualiza una compra y sus detalles según flags:
   * - toUpdate = true (y toCreate/toDelete = false) => PUT
   * - toCreate = true (y toDelete = false) => POST
   * - toDelete = true => DELETE
   */
  async updateWithDetails(purchase: Purchase): Promise<Purchase> {
    if (!purchase.id) {
      throw new Error('ID de la compra indefinido')
    }

    // Procesar detalles
    for (const det of purchase.purchase_details ?? []) {
      // Eliminar primero los marcados para borrar
      if (det.toCreate && det.toDelete) {
        continue
      }

      // Actualizar los existentes
      if (det.toUpdate && !det.toCreate && !det.toDelete && det.id) {
        if (!det.productId || !det.personId) {
          throw new Error('Producto o persona indefinida en detalle a actualizar')
        }
        const payload = {
          weight_kg: det.weight_kg,
          productId: det.productId,
          personId: det.personId,
        }
        await purchaseDetailsService.update(det.id, payload)
        continue
      }

      if (!det.id) {
        throw new Error('ID de detalle indefinido')
      }

      const isNotDeletedNewDetail = det.id > 0
      const isDeletedDetail = isNotDeletedNewDetail && det.toDelete && !det.toCreate
      if (isDeletedDetail) {
        // Eliminar detalle existente
        await purchaseDetailsService.delete(det.id)
        continue
      }

      // Crear nuevos detalles
      if (det.toCreate && !det.toDelete && !det.toUpdate) {
        if (!det.productId || !det.personId) {
          throw new Error('Producto o persona indefinida en detalle a crear')
        }
        const payload = {
          weight_kg: det.weight_kg,
          productId: det.productId,
          personId: det.personId,
        }
        await axios.post(`${this.getUrl()}/${purchase.id}/purchase-details`, payload)
      }
    }

    // Recalcular total_kg de todos los detalles conservados o nuevos
    purchase.total_kg = (purchase.purchase_details ?? [])
      .filter((d) => !d.toDelete)
      .reduce((sum, d) => sum + (d.weight_kg ?? 0), 0)

    // Actualizar compra principal
    const toUpdatePurchase = { ...purchase }
    delete toUpdatePurchase.purchase_details
    delete toUpdatePurchase.id
    const updateRes = await axios.put(
      `${this.getUrl()}/${purchase.id}`,
      toUpdatePurchase
    )
    const updatedPurchase: Purchase = updateRes.data
    return updatedPurchase
  }

  async deleteWithDetails(id: number): Promise<void> {
    try {
      await axios.delete(`${this.getUrl()}/${id}/purchase-details`)
    } catch (error) {
      this.handleError(error, 'Error deleting purchase with details')
    }
  }

  // Método específico para obtener compras paginadas
  async getAllPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Purchase>> {
    return this.getPaginated(page, limit)
  }

  async getAllPaginatedWithDetails(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Purchase>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        filter: JSON.stringify({
          include: [{ relation: 'purchase_details' }],
          order: ['date DESC'],
        }),
      })
      return await this.handleResponse<PaginatedResponse<Purchase>>(
        axios.get(`${this.getUrl()}?${params.toString()}`)
      )
    } catch (error) {
      this.handleError(error, 'Error getting paginated purchases with details')
    }
  }
}

export const purchaseService = new PurchaseService()
