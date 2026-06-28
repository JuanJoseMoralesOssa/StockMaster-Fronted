import { useMemo } from 'react'
import { ProductSummary } from '../types/ProductSummary'
import { useProductStore } from '../stores/useProductStore'

interface DetailWithProduct {
  productId?: number | null
  weight_kg?: number | null
  toDelete?: boolean
}

export const useDetailsSummary = <T extends DetailWithProduct>(details: T[]) => {
  const products = useProductStore((s) => s.products)

  const productSummary = useMemo((): ProductSummary[] => {
    const summary: Record<string, ProductSummary> = {}

    details.filter((row) => !row.toDelete).forEach((detail) => {
      const weight = detail.weight_kg ?? 0
      if (detail.productId && detail.productId > 0 && weight > 0) {
        const product = products.find((p) => p.id === detail.productId)
        if (product) {
          const productId = String(detail.productId)
          if (!summary[productId]) {
            summary[productId] = {
              id: detail.productId as number,
              name: product.name,
              total_weight: 0,
            }
          }
          summary[productId].total_weight += weight
        }
      }
    })

    return Object.values(summary)
  }, [details, products])

  return { productSummary }
}
