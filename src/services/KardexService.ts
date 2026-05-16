import Kardex from '../types/Kardex'
import { PaginatedResponse } from '../types/PaginatedResponse'
import { ApiService } from './ApiService'
import { httpClient } from './httpClient'
import type { KardexFilters } from '../config/kardexPageConfig'

export class KardexService extends ApiService<Kardex> {
  constructor() {
    super('kardexes')
  }

  // Método específico para obtener kardex paginados
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
    limit: number = 10
  ): Promise<PaginatedResponse<Kardex>> {
    const kardexes = await this.getKardexByProducts()
    const startDate = filters.activeDate && filters.startDate ? new Date(`${filters.startDate}T00:00:00`) : null
    const endDate = filters.activeDate && filters.endDate ? new Date(`${filters.endDate}T23:59:59`) : null
    const productId = filters.productId ? Number(filters.productId) : null
    const operation = filters.operation ? Number(filters.operation) : null
    const balanceRecord = filters.balanceRecord

    const filteredKardexes = kardexes.filter((entry) => {
      const entryDate = new Date(entry.date)

      if (productId && entry.productId !== productId) return false
      if (operation && entry.operation !== operation) return false
      if (balanceRecord === 'yes' && !entry.balance_record) return false
      if (balanceRecord === 'no' && entry.balance_record) return false
      if (startDate && entryDate < startDate) return false
      if (endDate && entryDate > endDate) return false

      return true
    })

    const start = (page - 1) * limit
    const data = filteredKardexes.slice(start, start + limit)
    const totalPages = Math.max(1, Math.ceil(filteredKardexes.length / limit))

    return {
      count: filteredKardexes.length,
      data,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    }
  }

  // Métodos específicos para proveedores
  async getKardexByProducts(): Promise<Kardex[]> {
    try {
      const params = new URLSearchParams({
        filter: JSON.stringify({
          include: [{ relation: 'product' }],
          order: ['date DESC'],
        }),
      })
      const response = await httpClient.get<Kardex[]>(`${this.getUrl()}/all?${params.toString()}`)
      return response.data
    } catch (error) {
      this.handleError(error, 'Error getting kardex by product ID')
    }
  }
}
export const kardexService = new KardexService()
