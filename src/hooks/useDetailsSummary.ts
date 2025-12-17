import { useState, useEffect } from 'react'
import { ProductSummary } from '../types/ProductSummary'
import { useProductStore } from '../stores/useProductStore'

// Interfaz genérica para cualquier tipo de detalle que tenga productId y weight_kg
interface DetailWithProduct {
  productId?: number | null
  weight_kg?: number | null
  toDelete?: boolean
}

/**
 * Hook genérico para calcular resumen de productos desde detalles
 * Funciona con PurchaseDetails, ExpenseDetails o cualquier tipo similar
 */
export const useDetailsSummary = <T extends DetailWithProduct>(
  details: T[]
) => {
  const [productSummary, setProductSummary] = useState<ProductSummary[]>([])
  const products = useProductStore(state => state.products)

  useEffect(() => {
    const summary: Record<string, ProductSummary> = {}

    details
      .filter((row) => !row.toDelete)
      .forEach((detail) => {
        if (detail.productId) {
          // Buscar el producto seleccionado para obtener su nombre
          const product = products.find((p) => p.id === detail.productId)
          if (product) {
            const productId = detail.productId
            if (productId && !summary[productId]) {
              summary[productId] = {
                id: productId,
                name: product.name,
                total_weight: 0,
              }
            }
            if (productId) {
              summary[productId].total_weight += detail.weight_kg ?? 0
            }
          }
        }
      })
    setProductSummary(Object.values(summary))
  }, [products, details])

  return { productSummary }
}
