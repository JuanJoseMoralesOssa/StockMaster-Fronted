import Product from '../types/Product'
import { productService } from '../services/ProductService'
import { createEntityStore } from './createEntityStore'

export const useProductStore = createEntityStore<Product, 'products'>('products', productService)
