import { useState, useEffect } from 'react'
import ExpenseDetails from '../types/ExpenseDetails'
import { ProductSummary } from '../types/ProductSummary'
import { productService } from '../services/ProductService'
import Product from '../types/Product'

const fetchProducts = async () => {
  return await productService.getAll()
}

export const useExpenseSummary = (expensesDetails: ExpenseDetails[]) => {
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

    expensesDetails
      .filter((row) => !row.toDelete)
      .forEach(async (expense) => {
        if (expense.productId) {
          // Buscar el producto seleccionado para obtener su nombre
          const product = products.find((p) => p.id === expense.productId)
          if (product) {
            const productId = expense.productId
            if (productId && !summary[productId]) {
              summary[productId] = {
                id: productId,
                name: product.name,
                total_weight: 0,
              }
            }
            if (productId) {
              summary[productId].total_weight += expense.weight_kg ?? 0
            }
          }
        }
      })
    setProductSummary(Object.values(summary))
  }, [products, expensesDetails])

  return { productSummary }
}
