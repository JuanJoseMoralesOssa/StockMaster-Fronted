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
      purchase.total_kg = 0
      return this.create(purchase)
    }
    const purchaseDetails = []
    for (const det of purchase.purchase_details) {
      const detail = {
        weight_kg: det.weight_kg,
        productId: det.productId,
        personId: det.personId,
      }
      purchaseDetails.push(detail)
    }
    const response = await axios.post(
      this.getUrl() + '/with-details', {
      date: purchase.date,
      purchaseDetails
    });
    return response.data as Purchase;
  }

  /**
   * Actualiza una compra y sus detalles según flags:
   * - toUpdate = true => PUT
   * - toCreate = true => POST
   * - toDelete = true => DELETE
   */
  async updateWithDetails(purchase: Purchase): Promise<Purchase> {
    if (!purchase.id) {
      throw new Error('ID de la compra indefinido')
    }
    for (const det of purchase.purchase_details ?? []) {
      if (!det.productId || !det.personId) {
        throw new Error('Producto o persona indefinida en detalle a actualizar')
      }
      if (det.toDelete && det.id) {
        await purchaseDetailsService.delete(det.id)
      } else if (det.toUpdate && det.id) {
        const payload = {
          weight_kg: det.weight_kg,
          productId: det.productId,
          personId: det.personId,
        }
        await purchaseDetailsService.update(det.id, payload)
      } else if (det.toCreate) {
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

  async getAllPaginatedFiltered(
    filters: { startDate?: string; endDate?: string; personId?: string; productId?: string, activeDate: boolean },
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<Purchase>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      if (filters.activeDate) {
        if (filters.startDate) {
          params.append('startDate', filters.startDate)
        }
        if (filters.endDate) {
          params.append('endDate', filters.endDate)
        }
      }
      if (filters.personId) {
        params.append('personId', filters.personId)
      }
      if (filters.productId) {
        params.append('productId', filters.productId)
      }
      return await this.handleResponse<PaginatedResponse<Purchase>>(
        axios.get(`${this.getUrl()}/filtered?${params.toString()}`)
      )
    } catch (error) {
      this.handleError(error, 'Error getting paginated purchases with details')
    }
  }
}

export const purchaseService = new PurchaseService()
