import axios from 'axios'
import { Config } from '../config/Config'
import { httpClient } from './httpClient'
import {
  DashboardSummaryResponse,
  AnalyticsFilters,
  InventorySummaryResponse,
  PendingTrendPoint,
  PendingTrendInterval,
  PendingBySupplier,
  PendingByProduct,
} from '../types/Analytics'

const API_BASE_URL = Config.LOGIC_URL

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
            throw new Error(`${errorMessage}: ${errorData.message}`)
          }
        }

        throw new Error(`${errorMessage}: Error HTTP ${status} ${statusText}`)
      } else if (axiosError.request) {
        throw new Error(`${errorMessage}: No se recibió respuesta del servidor`)
      } else {
        throw new Error(`${errorMessage}: ${axiosError.message}`)
      }
    }

    throw new Error(`${errorMessage}: Error inesperado`)
  }

  async getDashboardSummary(filters: AnalyticsFilters): Promise<DashboardSummaryResponse> {
    try {
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        ...(filters.type && { type: filters.type }),
        ...(filters.limit && { limit: filters.limit.toString() }),
      })

      const response = await httpClient.get(
        `${this.getUrl('dashboard-summary')}?${params.toString()}`,
      )

      return response.data
    } catch (error) {
      this.handleError(error, 'Error obteniendo el dashboard summary')
    }
  }

  async getInventorySummary(lowBalanceThreshold?: number): Promise<InventorySummaryResponse> {
    try {
      const query =
        lowBalanceThreshold != null
          ? `?lowBalanceThreshold=${lowBalanceThreshold}`
          : ''
      const response = await httpClient.get(
        `${this.getUrl('inventory-summary')}${query}`,
      )

      return response.data
    } catch (error) {
      this.handleError(error, 'Error obteniendo el resumen de inventario')
    }
  }

  async getPendingTrend(
    startDate: string,
    endDate: string,
    interval: PendingTrendInterval = 'day',
  ): Promise<PendingTrendPoint[]> {
    try {
      const params = new URLSearchParams({ startDate, endDate, interval })
      const response = await httpClient.get(
        `${this.getUrl('pending-trend')}?${params.toString()}`,
      )
      return response.data
    } catch (error) {
      this.handleError(error, 'Error obteniendo la tendencia del pendiente')
    }
  }

  async getPendingBySupplier(limit?: number): Promise<PendingBySupplier[]> {
    try {
      const query = limit != null ? `?limit=${limit}` : ''
      const response = await httpClient.get(`${this.getUrl('pending-by-supplier')}${query}`)
      return response.data
    } catch (error) {
      this.handleError(error, 'Error obteniendo el pendiente por proveedor')
    }
  }

  async getPendingByProduct(limit?: number): Promise<PendingByProduct[]> {
    try {
      const query = limit != null ? `?limit=${limit}` : ''
      const response = await httpClient.get(`${this.getUrl('pending-by-product')}${query}`)
      return response.data
    } catch (error) {
      this.handleError(error, 'Error obteniendo el pendiente por producto')
    }
  }
}

export const analyticsService = new AnalyticsService()
