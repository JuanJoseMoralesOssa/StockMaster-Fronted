import axios from 'axios'
import Kardex from '../types/Kardex'
import { ApiService } from './ApiService'

export class KardexService extends ApiService<Kardex> {
  constructor() {
    super('kardexes')
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
