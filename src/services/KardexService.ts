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

  async getKardexByProducts(productId?: number): Promise<Kardex[]> {
    try {
      const params = new URLSearchParams()
      if (productId != null) params.append('productId', productId.toString())
      const query = params.toString() ? `?${params.toString()}` : ''
      return await this.handleResponse<Kardex[]>(
        httpClient.get(`${this.getUrl()}/all${query}`),
      )
    } catch (error) {
      this.handleError(error, 'Error al obtener el kardex del producto')
    }
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
