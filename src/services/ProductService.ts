import Product from '../types/Product'
import Kardex from '../types/Kardex'
import { PaginatedResponse } from '../types/PaginatedResponse'
import { ApiService } from './ApiService'
import { httpClient } from './httpClient'

/** Ajuste manual de inventario: fijar el balance real ('set') o sumar/restar ('delta'). */
export interface BalanceAdjustmentInput {
    mode: 'set' | 'delta'
    value: number
    note: string
}

export class ProductService extends ApiService<Product> {
    constructor() {
        super('products', 'productos')
    }

    /**
     * Ajuste manual de balance: el backend actualiza Product.balance y escribe la
     * fila de kardex (operación "Ajuste manual") de forma atómica. Devuelve el
     * movimiento de kardex creado (con su producto).
     */
    async adjustBalance(productId: number, input: BalanceAdjustmentInput): Promise<Kardex> {
        try {
            return await this.handleResponse<Kardex>(
                httpClient.post(this.getUrl(`${productId}/adjustment`), input),
            )
        } catch (error) {
            this.handleError(error, 'Error al ajustar el balance del producto')
        }
    }

    // Método específico para obtener productos paginados
    async getAllPaginated(
        page: number = 1,
        limit: number = 10
    ): Promise<PaginatedResponse<Product>> {
        return this.getPaginated(page, limit)
    }

    async getAllPaginatedFiltered(
        filters: { name?: string },
        page: number = 1,
        limit: number = 10
    ): Promise<PaginatedResponse<Product>> {
        const searchTerm = filters.name?.trim().toLowerCase()

        if (!searchTerm) {
            return this.getAllPaginated(page, limit)
        }

        const products = await this.getAll()
        const filteredProducts = products.filter(product =>
            product.name.toLowerCase().includes(searchTerm)
        )
        const start = (page - 1) * limit
        const data = filteredProducts.slice(start, start + limit)
        const totalPages = Math.max(1, Math.ceil(filteredProducts.length / limit))

        return {
            count: filteredProducts.length,
            data,
            page,
            limit,
            totalPages,
            hasNext: page < totalPages,
            hasPrevious: page > 1,
        }
    }

}

// Exportar instancias para uso directo
export const productService = new ProductService()
