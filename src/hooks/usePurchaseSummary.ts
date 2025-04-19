import { useState, useEffect } from 'react'
import PurchaseDetails from '../types/PurchaseDetails'
import { ProductSummary } from '../types/ProductSummary'
import { productService } from '../services/ProductService'
import Product from '../types/Product'

const fetchProducts = async () => {
  return await productService.getAll()
}

export const usePurchaseSummary = (purchasesDetails: PurchaseDetails[]) => {
  const [productSummary, setProductSummary] = useState<ProductSummary[]>([])
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    const loadProducts = async () => {
      const fetchedProducts = await fetchProducts()
      setProducts(fetchedProducts)
    }
    loadProducts()
  }, [])

  useEffect(() => {
    const summary: Record<string, ProductSummary> = {}

    purchasesDetails
      .filter((row) => !row.toDelete)
      .forEach(async (purchase) => {
        if (purchase.productId) {
          // Buscar el producto seleccionado para obtener su nombre
          const product = products.find((p) => p.id === purchase.productId)
          if (product) {
            const productId = purchase.productId
            if (productId && !summary[productId]) {
              summary[productId] = {
                id: productId,
                name: product.name,
                total_weight: 0,
              }
            }
            if (productId) {
              summary[productId].total_weight += purchase.weight_kg ?? 0
            }
          }
        }
      })
    setProductSummary(Object.values(summary))
  }, [products, purchasesDetails])

  return { productSummary }
}
