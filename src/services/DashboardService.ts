import { Config } from "../config/Config"
import { DashboardResult, PersonReportRow, ProductReportRow } from "../types/DashboardResults"
import { httpClient } from "./httpClient"
const API_BASE_URL = Config.LOGIC_URL

export class DashboardService {
  /**
   * Fetches the dashboard data from the API.
   * @returns {Promise<>} The dashboard data.
   * @throws {Error} If there is an error fetching the data.
   */

  async getPersonProductTransactions(
    personId: number,
    productId: number,
    startDate: string,
    endDate: string
  ): Promise<
    DashboardResult[]
  > {
    try {
      const response = await httpClient.get(
        `${API_BASE_URL}reports/details/person/${personId}/product/${productId}`,
        {
          params: {
            startDate,
            endDate
          }
        }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching transactions:', error)
      throw error
    }
  }

  async getPersonTransactions(
    personId: number,
    startDate: string,
    endDate: string
  ): Promise<PersonReportRow[]> {
    try {
      const response = await httpClient.get(
        `${API_BASE_URL}reports/details/person/${personId}`,
        {
          params: {
            startDate,
            endDate
          }
        }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching transactions:', error)
      throw error
    }
  }

  async getProductTransactions(
    productId: number,
    startDate: string,
    endDate: string
  ): Promise<ProductReportRow[]> {
    try {
      const response = await httpClient.get(
        `${API_BASE_URL}reports/details/product/${productId}`,
        {
          params: {
            startDate,
            endDate
          }
        }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching transactions:', error)
      throw error
    }
  }
  /** Drill-down: historial de un proveedor para un producto en un rango de fechas. */
  async getSupplierProductDetails(
    supplierId: number,
    productId: number,
    startDate: string,
    endDate: string,
  ): Promise<DashboardResult[]> {
    try {
      const response = await httpClient.get(
        `${API_BASE_URL}reports/details/supplier/${supplierId}/product/${productId}`,
        { params: { startDate, endDate } },
      )
      return response.data
    } catch (error) {
      console.error('Error fetching supplier product details:', error)
      throw error
    }
  }
}
export const dashboardService = new DashboardService()
