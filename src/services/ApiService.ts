import { AxiosResponse } from 'axios'
import { Config } from '../config/Config'
import { httpClient } from './httpClient'
import { extractErrorInfo } from '../utils/error'
import { PaginatedResponse } from '../types/PaginatedResponse'

// Base URL para todas las peticiones
const API_BASE_URL = Config.LOGIC_URL

// Clase base para servicios API
export class ApiService<T> {
  private readonly endpoint: string
  /** Nombre legible (en español) para los mensajes de error que ve el usuario. */
  protected readonly entityLabel: string

  constructor(endpoint: string, entityLabel?: string) {
    this.endpoint = endpoint
    this.entityLabel = entityLabel ?? endpoint
  }

  // Método para obtener la URL completa
  protected getUrl(path: string = ''): string {
    return `${API_BASE_URL}${this.endpoint}${path ? '/' + path : ''}`
  }

  /**
   * Contextualiza el error con el nombre de la entidad y lo relanza. Loguea UNA
   * sola vez, acá: los llamadores muestran el mensaje pero no vuelven a loguear.
   */
  protected handleError(error: unknown, errorMessage: string): never {
    const { message } = extractErrorInfo(error)
    const detail = message ?? 'Error inesperado'

    console.error(`[ApiService.${this.entityLabel}] ${errorMessage}: ${detail}`, error)
    throw new Error(`${errorMessage}: ${detail}`, { cause: error })
  }

  // Método genérico para procesar respuestas
  protected async handleResponse<R>(promise: Promise<AxiosResponse<R>>): Promise<R> {
    return (await promise).data
  }

  // Public helper to build URLs for external use (e.g., tests or logging)
  // Keeps internal `getUrl` protected while exposing a safe wrapper.
  public buildUrl(path: string = ''): string {
    return this.getUrl(path)
  }

  // Métodos CRUD genéricos
  async getAll(): Promise<T[]> {
    try {
      return await this.handleResponse<T[]>(httpClient.get(`${this.getUrl()}/all`))
    } catch (error) {
      this.handleError(error, `Error al obtener ${this.entityLabel}`)
    }
  }

  // Método para obtener datos paginados
  async getPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResponse<T>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })
      return await this.handleResponse<PaginatedResponse<T>>(
        httpClient.get(`${this.getUrl()}?${params.toString()}`)
      )
    } catch (error) {
      this.handleError(error, `Error al obtener la lista de ${this.entityLabel}`)
    }
  }

  async getById(id: number | string): Promise<T> {
    try {
      return await this.handleResponse<T>(
        httpClient.get(this.getUrl(id.toString()))
      )
    } catch (error) {
      this.handleError(error, `Error al obtener ${this.entityLabel} con id ${id}`)
    }
  }

  async create(data: Partial<T>): Promise<T> {
    try {
      return await this.handleResponse<T>(
        httpClient.post(this.getUrl(), data)
      )
    } catch (error) {
      this.handleError(error, `Error al crear ${this.entityLabel}`)
    }
  }

  async update(id: number | string, data: Partial<T>): Promise<T> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _omit, ...payload } = data as Partial<T> & { id?: unknown }
      return await this.handleResponse<T>(
        httpClient.put(this.getUrl(id.toString()), payload)
      )
    } catch (error) {
      this.handleError(error, `Error al actualizar ${this.entityLabel} con id ${id}`)
    }
  }


  async updatePartial(id: number | string, data: Partial<T>): Promise<T> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _omit, ...payload } = data as Partial<T> & { id?: unknown }
      return await this.handleResponse<T>(
        httpClient.patch(this.getUrl(id.toString()), payload)
      )
    } catch (error) {
      this.handleError(error, `Error al actualizar ${this.entityLabel} con id ${id}`)
    }
  }

  async delete(id: number | string): Promise<void> {
    try {
      await this.handleResponse<void>(
        httpClient.delete(this.getUrl(id.toString()))
      )
    } catch (error) {
      this.handleError(error, `Error al eliminar ${this.entityLabel} con id ${id}`)
    }
  }
}
