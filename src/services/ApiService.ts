import axios, { AxiosError, AxiosResponse } from 'axios'
import { Config } from '../config/Config'
import { httpClient } from './httpClient'
import { PaginatedResponse } from '../types/PaginatedResponse'

// Base URL para todas las peticiones
const API_BASE_URL = Config.LOGIC_URL

// Clase base para servicios API
export class ApiService<T> {
  private readonly endpoint: string

  constructor(endpoint: string) {
    this.endpoint = endpoint
  }

  // Método para obtener la URL completa
  protected getUrl(path: string = ''): string {
    return `${API_BASE_URL}${this.endpoint}${path ? '/' + path : ''}`
  }

  // Método genérico para manejar errores con mensajes contextualizados
  protected handleError(error: unknown, errorMessage: string): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError

      if (axiosError.response) {
        const status = axiosError.response.status
        const statusText = axiosError.response.statusText

        // Intentar extraer mensaje de error del cuerpo de la respuesta
        if (axiosError.response.data) {
          const errorData = axiosError.response.data as { message?: string }
          if (errorData.message) {
            console.error(`${errorMessage}: ${errorData.message}`)
            throw new Error(`${errorMessage}: ${errorData.message}`, { cause: error as Error })
          }
        }

        console.error(`${errorMessage}: ${status} ${statusText}`)
        throw new Error(`${errorMessage}: Error HTTP ${status} ${statusText}`, { cause: error as Error })
      } else if (axiosError.request) {
        console.error(`${errorMessage}: No se recibió respuesta del servidor`)
        throw new Error(`${errorMessage}: No se recibió respuesta del servidor`, { cause: error as Error })
      } else {
        console.error(`${errorMessage}: ${axiosError.message}`)
        throw new Error(`${errorMessage}: ${axiosError.message}`, { cause: error as Error })
      }
    }

    // Para errores que no son de Axios
    console.error(errorMessage, error)
    throw new Error(`${errorMessage}: Error inesperado`, { cause: error as Error })
  }

  // Método genérico para procesar respuestas
  protected async handleResponse<R>(promise: Promise<AxiosResponse<R>>): Promise<R> {
    try {
      const response = await promise
      return response.data
    } catch (error) {
      console.error('Error processing response:', error)
      throw error
    }
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
      this.handleError(error, `Error getting all ${this.endpoint}`)
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
      this.handleError(error, `Error getting paginated ${this.endpoint}`)
    }
  }

  async getById(id: number | string): Promise<T> {
    try {
      return await this.handleResponse<T>(
        httpClient.get(this.getUrl(id.toString()))
      )
    } catch (error) {
      this.handleError(error, `Error getting ${this.endpoint} with id ${id}`)
    }
  }

  async create(data: Partial<T>): Promise<T> {
    try {
      return await this.handleResponse<T>(
        httpClient.post(this.getUrl(), data)
      )
    } catch (error) {
      this.handleError(error, `Error creating ${this.endpoint}`)
    }
  }

  async update(id: number | string, data: Partial<T>): Promise<T> {
    try {
      if ('id' in data) {
        delete (data as Partial<T> & { id?: unknown }).id
      }
      return await this.handleResponse<T>(
        httpClient.put(this.getUrl(id.toString()), data)
      )
    } catch (error) {
      this.handleError(error, `Error updating ${this.endpoint} with id ${id}`)
    }
  }


  async updatePartial(id: number | string, data: Partial<T>): Promise<T> {
    try {
      if ('id' in data) {
        delete (data as Partial<T> & { id?: unknown }).id
      }
      return await this.handleResponse<T>(
        httpClient.patch(this.getUrl(id.toString()), data)
      )
    } catch (error) {
      this.handleError(error, `Error partially updating ${this.endpoint} with id ${id}`)
    }
  }

  async delete(id: number | string): Promise<void> {
    try {
      await this.handleResponse<void>(
        httpClient.delete(this.getUrl(id.toString()))
      )
    } catch (error) {
      this.handleError(error, `Error deleting ${this.endpoint} with id ${id}`)
    }
  }
}
