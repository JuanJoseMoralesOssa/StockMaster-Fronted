import Product from '../types/Product'
import { productService } from '../services/ProductService'
import { createEntityStore } from './createEntityStore'
import { UseBoundStore, StoreApi } from 'zustand'
import { EntityStore } from '../types/StoreTypes'

type ProductStore = UseBoundStore<StoreApi<EntityStore<Product, 'products'>>>

export const useProductStore: ProductStore = createEntityStore<Product, 'products'>('products', productService)
