import axios from 'axios';
import { Config } from '../config/Config';
import {
  DateRangeAnalytics,
  SupplierAnalytics,
  ProductAnalytics,
  AnalyticsFilters
} from '../types/Analytics';

const API_BASE_URL = Config.LOGIC_URL;
const defaultConfig = Config.defaultConfig;

export class AnalyticsService {
  private readonly endpoint = 'analytics';

  private getUrl(path: string = ''): string {
    return `${API_BASE_URL}${this.endpoint}${path ? '/' + path : ''}`;
  }

  private handleError(error: any, errorMessage: string): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error;

      if (axiosError.response) {
        const status = axiosError.response.status;
        const statusText = axiosError.response.statusText;

        if (axiosError.response.data) {
          const errorData = axiosError.response.data;
          if (errorData && typeof errorData === 'object' && 'message' in errorData) {
            console.error(`${errorMessage}: ${errorData.message}`);
            throw new Error(`${errorMessage}: ${errorData.message}`);
          }
        }

        console.error(`${errorMessage}: ${status} ${statusText}`);
        throw new Error(`${errorMessage}: Error HTTP ${status} ${statusText}`);
      } else if (axiosError.request) {
        console.error(`${errorMessage}: No se recibió respuesta del servidor`);
        throw new Error(`${errorMessage}: No se recibió respuesta del servidor`);
      } else {
        console.error(`${errorMessage}: ${axiosError.message}`);
        throw new Error(`${errorMessage}: ${axiosError.message}`);
      }
    }

    console.error(errorMessage, error);
    throw new Error(`${errorMessage}: Error inesperado`);
  }

  async getDateRangeAnalytics(filters: AnalyticsFilters): Promise<DateRangeAnalytics> {
    try {
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        ...(filters.type && { type: filters.type })
      });

      const response = await axios.get(
        `${this.getUrl('date-range')}?${params.toString()}`,
        defaultConfig
      );

      return response.data;
    } catch (error) {
      this.handleError(error, 'Error obteniendo analytics por rango de fechas');
    }
  }

  async getTopSuppliers(filters: AnalyticsFilters): Promise<SupplierAnalytics[]> {
    try {
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        ...(filters.limit && { limit: filters.limit.toString() })
      });

      const response = await axios.get(
        `${this.getUrl('suppliers/top')}?${params.toString()}`,
        defaultConfig
      );

      return response.data;
    } catch (error) {
      this.handleError(error, 'Error obteniendo top proveedores');
    }
  }

  async getTopProducts(filters: AnalyticsFilters): Promise<ProductAnalytics[]> {
    try {
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        ...(filters.limit && { limit: filters.limit.toString() })
      });

      const response = await axios.get(
        `${this.getUrl('products/top')}?${params.toString()}`,
        defaultConfig
      );

      return response.data;
    } catch (error) {
      this.handleError(error, 'Error obteniendo top productos');
    }
  }

  async getProductsByTransactionCount(filters: AnalyticsFilters): Promise<ProductAnalytics[]> {
    try {
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        ...(filters.limit && { limit: filters.limit.toString() })
      });

      const response = await axios.get(
        `${this.getUrl('products/most-transactions')}?${params.toString()}`,
        defaultConfig
      );

      return response.data;
    } catch (error) {
      this.handleError(error, 'Error obteniendo productos por mayor número de transacciones');
    }
  }

  async getProductsWithLeastTransactions(filters: AnalyticsFilters): Promise<ProductAnalytics[]> {
    try {
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        ...(filters.limit && { limit: filters.limit.toString() })
      });

      const response = await axios.get(
        `${this.getUrl('products/least-transactions')}?${params.toString()}`,
        defaultConfig
      );

      return response.data;
    } catch (error) {
      this.handleError(error, 'Error obteniendo productos con menor número de transacciones');
    }
  }

  async getSuppliersByTransactionCount(filters: AnalyticsFilters): Promise<SupplierAnalytics[]> {
    try {
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        ...(filters.limit && { limit: filters.limit.toString() })
      });

      const response = await axios.get(
        `${this.getUrl('suppliers/most-transactions')}?${params.toString()}`,
        defaultConfig
      );

      return response.data;
    } catch (error) {
      this.handleError(error, 'Error obteniendo proveedores por mayor número de transacciones');
    }
  }

  async getSuppliersWithLeastTransactions(filters: AnalyticsFilters): Promise<SupplierAnalytics[]> {
    try {
      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        ...(filters.limit && { limit: filters.limit.toString() })
      });

      const response = await axios.get(
        `${this.getUrl('suppliers/least-transactions')}?${params.toString()}`,
        defaultConfig
      );

      return response.data;
    } catch (error) {
      this.handleError(error, 'Error obteniendo proveedores con menor número de transacciones');
    }
  }
}

export const analyticsService = new AnalyticsService();
