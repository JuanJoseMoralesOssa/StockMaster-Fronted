import Kardex, { KardexFilters } from '../types/Kardex'
import { PaginatedResponse } from '../types/PaginatedResponse'
import { ApiService } from './ApiService'
import { httpClient } from './httpClient'

export class KardexService extends ApiService<Kardex> {
  constructor() {
    super('kardexes', 'kardex')
  }

  async getAllPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Kardex>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        filter: JSON.stringify({
          include: [{ relation: 'product' }],
          order: ['date DESC'],
        }),
      })

      return await this.handleResponse<PaginatedResponse<Kardex>>(
        httpClient.get(`${this.getUrl()}?${params.toString()}`),
      )
    } catch (error) {
      this.handleError(error, 'Error al obtener la lista de kardex')
    }
  }

  // El kardex no expone `/kardexes/all` (es append-only y siempre paginado).
  // Sobrescribimos el getAll() heredado para que un uso accidental falle claro
  // en lugar de pegarle a un 404. Usa getAllPaginated()/getAllPaginatedFiltered().
  override async getAll(): Promise<Kardex[]> {
    throw new Error(
      'Kardex no expone /all; usa getAllPaginated() o getAllPaginatedFiltered()',
    )
  }

  async getAllPaginatedFiltered(
    filters: KardexFilters,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<Kardex>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      if (filters.activeDate) {
        if (filters.startDate) params.append('startDate', filters.startDate)
        if (filters.endDate) params.append('endDate', filters.endDate)
      }

      if (filters.productId) params.append('productId', filters.productId)
      if (filters.operation) params.append('operation', filters.operation)

      return await this.handleResponse<PaginatedResponse<Kardex>>(
        httpClient.get(`${this.getUrl()}/filtered?${params.toString()}`),
      )
    } catch (error) {
      this.handleError(error, 'Error al obtener el kardex filtrado')
    }
  }
}
export const kardexService = new KardexService()
