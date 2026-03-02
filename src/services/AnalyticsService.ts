import axios from 'axios'
import { Config } from '../config/Config'
import {
  DashboardSummaryResponse,
  AnalyticsFilters
} from '../types/Analytics'

const API_BASE_URL = Config.LOGIC_URL
const defaultConfig = Config.defaultConfig

export class AnalyticsService {
  private readonly endpoint = 'analytics';

  private getUrl(path: string = ''): string {
    return `${API_BASE_URL}${this.endpoint}${path ? '/' + path : ''}`
  }

  private handleError(error: unknown, errorMessage: string): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error

      if (axiosError.response) {
        const status = axiosError.response.status
        const statusText = axiosError.response.statusText

        if (axiosError.response.data) {
          const errorData = axiosError.response.data
          if (errorData && typeof errorData === 'object' && 'message' in errorData) {
            console.error(`${errorMessage}: ${errorData.message}`)
            throw new Error(`${errorMessage}: ${errorData.message}`)
          }
        }

        console.error(`${errorMessage}: ${status} ${statusText}`)
        throw new Error(`${errorMessage}: Error HTTP ${status} ${statusText}`)
      } else if (axiosError.request) {
        console.error(`${errorMessage}: No se recibió respuesta del servidor`)
        throw new Error(`${errorMessage}: No se recibió respuesta del servidor`)
      } else {
        console.error(`${errorMessage}: ${axiosError.message}`)
        throw new Error(`${errorMessage}: ${axiosError.message}`)
      }
    }

    console.error(errorMessage, error)
    throw new Error(`${errorMessage}: Error inesperado`)
  }

  async getDashboardSummary(filters: AnalyticsFilters): Promise<DashboardSummaryResponse> {
    try {
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        ...(filters.type && { type: filters.type }),
        ...(filters.limit && { limit: filters.limit.toString() })
      })

      const response = await axios.get(
        `${this.getUrl('dashboard-summary')}?${params.toString()}`,
        defaultConfig
      )

      return response.data
    } catch (error) {
      this.handleError(error, 'Error obteniendo el dashboard summary')
    }
  }
}

export const analyticsService = new AnalyticsService()
