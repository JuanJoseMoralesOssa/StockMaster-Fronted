import axios from "axios"
import { Config } from "../config/Config"
import { DashboardResult, ProductsResults, SuppliersResults } from "../types/DashboardResults"
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
      const response = await axios.get(
        `${API_BASE_URL}person/${personId}/product/${productId}/transactions`,
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
  ): Promise<ProductsResults[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}person/${personId}/transactions`,
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
  ): Promise<SuppliersResults[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}product/${productId}/transactions`,
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
}
export const dashboardService = new DashboardService()
