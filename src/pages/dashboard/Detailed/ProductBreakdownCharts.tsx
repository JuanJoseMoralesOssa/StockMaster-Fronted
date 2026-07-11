import React, { useMemo } from 'react'
import { PersonReportRow } from '../../../types/DashboardResults'
import Product from '../../../types/Product'
import { PaymentStatusFilter } from '../../../utils/chartTransforms'
import EntityBreakdownCharts, { type EntityBreakdownCopy } from './EntityBreakdownCharts'

interface Filters {
  startDate: string
  endDate: string
  supplierId: string
  productId: string
}

interface ProductBreakdownChartsProps {
  results: PersonReportRow[]
  products: Partial<Product>[]
  filters: Filters
  selectedFilter: PaymentStatusFilter
}

/** Estable entre renders: EntityBreakdownCharts la usa como dependencia de memo. */
const productIdOf = (row: PersonReportRow) => row.productId

/**
 * Las compras y pagos del PROVEEDOR seleccionado, desglosados por producto.
 * (El eje del desglose es el producto; de ahí el nombre.)
 */
function ProductBreakdownCharts({
  results,
  products,
  filters,
  selectedFilter,
}: Readonly<ProductBreakdownChartsProps>) {
  const entityNames = useMemo(() => {
    const names = new Map<number, string>()
    products.forEach((product) => {
      if (product.id !== undefined && product.name !== undefined) {
        names.set(product.id, product.name)
      }
    })
    return names
  }, [products])

  const copy: EntityBreakdownCopy = useMemo(
    () => ({
      entity: 'Producto',
      totalLabel: 'Total Pedido',
      monthlyTitle: 'Distribución Mensual de Pagos',
      overviewTitle: 'Panorama General de Pagos',
      perEntityTitle: 'Distribución Mensual de Pagos por Producto',
      dailyTitle: 'Distribución Diaria por Mes y Producto',
      tableTitle: 'Detalle Mensual',
      tableFirstColumnLabel: 'Mes',
      csvTitle: 'Reporte Mensual - Productos',
      csvFilename: `Reporte_Producto_${filters.supplierId}.csv`,
    }),
    [filters.supplierId],
  )

  return (
    <EntityBreakdownCharts
      results={results}
      entityIdOf={productIdOf}
      entityNames={entityNames}
      filters={filters}
      selectedFilter={selectedFilter}
      copy={copy}
    />
  )
}

export default React.memo(ProductBreakdownCharts)
