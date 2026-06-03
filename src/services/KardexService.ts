import Kardex from '../types/Kardex'
import { PaginatedResponse } from '../types/PaginatedResponse'
import { ApiService } from './ApiService'
import { httpClient } from './httpClient'
import type { KardexFilters } from '../config/kardexPageConfig'

export class KardexService extends ApiService<Kardex> {
  constructor() {
    super('kardexes')
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
      this.handleError(error, 'Error getting paginated kardexes with product')
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
      if (filters.balanceRecord) params.append('balanceRecord', filters.balanceRecord)

      return await this.handleResponse<PaginatedResponse<Kardex>>(
        httpClient.get(`${this.getUrl()}/filtered?${params.toString()}`),
      )
    } catch (error) {
      this.handleError(error, 'Error getting filtered kardexes')
    }
  }
}
export const kardexService = new KardexService()
