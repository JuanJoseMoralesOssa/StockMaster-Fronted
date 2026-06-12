import { useEffect } from 'react'
import DocumentDetailsExpandedView from '@/pages/components/common/DocumentDetailsExpandedView'
import { useProductStore, useSupplierStore } from '@/stores'
import type { DocumentDetailLike } from '@/types/DocumentBase'

/**
 * Vista expandida de los detalles de un documento (compra/gasto).
 * Carga los stores de productos/proveedores para resolver los nombres.
 */
export default function DocumentExpandedDetails<TDetail extends DocumentDetailLike>({
  details,
}: Readonly<{ details: TDetail[] }>) {
  const products = useProductStore((state) => state.products)
  const suppliers = useSupplierStore((state) => state.suppliers)
  const fetchProducts = useProductStore((state) => state.fetchProducts)
  const fetchSuppliers = useSupplierStore((state) => state.fetchSuppliers)

  useEffect(() => {
    fetchProducts()
    fetchSuppliers()
  }, [fetchProducts, fetchSuppliers])

  return (
    <DocumentDetailsExpandedView<TDetail>
      details={details}
      products={products}
      suppliers={suppliers}
    />
  )
}
