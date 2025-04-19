import Product from '../types/Product'
import { ApiService } from './ApiService'
// import axios from 'axios'
// import { Config } from '../config/Config'

export class ProductService extends ApiService<Product> {
    constructor() {
        super('products')
    }

    // // Aquí puedes agregar métodos específicos para productos
    // // Por ejemplo:
    // async getProductsOnSale(): Promise<Product[]> {
    //     try {
    //         const response = await axios.get(
    //             this.getUrl('on-sale'),
    //             Config.defaultConfig
    //         )
    //         return response.data
    //     } catch (error) {
    //         this.handleError(error, 'Error getting products on sale')
    //     }
    // }
}

// Exportar instancias para uso directo
export const productService = new ProductService()
