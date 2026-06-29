import Kardex, { KardexFilters } from '../types/Kardex'
import { PaginatedResponse } from '../types/PaginatedResponse'
import { ApiService } from './ApiService'
import { httpClient } from './httpClient'

const KARDEX_READ_ONLY =
  'El kardex es de solo lectura (append-only). Usa getAllPaginated()/getAllPaginatedFiltered(); para corregir inventario usa el ajuste (POST /products/{id}/adjustment).'

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

  // El kardex es un libro append-only generado por el sistema: el backend bloquea
  // crear/editar/eliminar (405) y no expone `/kardexes/all`. Bloqueamos las
  // operaciones de escritura y `getAll()` heredadas de ApiService para que un uso
  // accidental falle claro en vez de pegarle a un endpoint inexistente/bloqueado.
  override async getAll(): Promise<Kardex[]> {
    throw new Error(KARDEX_READ_ONLY)
  }
  override async create(): Promise<Kardex> {
    throw new Error(KARDEX_READ_ONLY)
  }
  override async update(): Promise<Kardex> {
    throw new Error(KARDEX_READ_ONLY)
  }
  override async updatePartial(): Promise<Kardex> {
    throw new Error(KARDEX_READ_ONLY)
  }
  override async delete(): Promise<void> {
    throw new Error(KARDEX_READ_ONLY)
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
