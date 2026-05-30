import Product from '../types/Product'
import { PaginatedResponse } from '../types/PaginatedResponse'
import { ApiService } from './ApiService'

export class ProductService extends ApiService<Product> {
    constructor() {
        super('products')
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
