import axios from 'axios'
import Kardex from '../types/Kardex'
import { PaginatedResponse } from '../types/PaginatedResponse'
import { ApiService } from './ApiService'

export class KardexService extends ApiService<Kardex> {
  constructor() {
    super('kardexes')
  }

  // Método específico para obtener kardex paginados
  async getAllPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Kardex>> {
    return this.getPaginated(page, limit)
  }

  // Métodos específicos para proveedores
  async getKardexByProducts(): Promise<Kardex[]> {
    try {
      const response = await axios.get<Kardex[]>(`${this.getUrl()}?filter={
        "include": [ {"relation":"product"} ]
        }`)
      return response.data
    } catch (error) {
      this.handleError(error, 'Error getting kardex by product ID')
      throw error
    }
  }
}
export const kardexService = new KardexService()
