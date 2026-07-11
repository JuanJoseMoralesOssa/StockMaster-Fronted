import React, { useMemo } from 'react'
import { ProductReportRow } from '../../../types/DashboardResults'
import Person from '../../../types/Person'
import { PaymentStatusFilter } from '../../../utils/chartTransforms'
import EntityBreakdownCharts, { type EntityBreakdownCopy } from './EntityBreakdownCharts'

interface Filters {
  startDate: string
  endDate: string
  supplierId: string
  productId: string
}

interface SupplierBreakdownChartsProps {
  results: ProductReportRow[]
  suppliers: Person[]
  filters: Filters
  selectedFilter: PaymentStatusFilter
}

/** Estable entre renders: EntityBreakdownCharts la usa como dependencia de memo. */
const personIdOf = (row: ProductReportRow) => row.personId

/**
 * Las compras y pagos del PRODUCTO seleccionado, desglosados por proveedor.
 * (El eje del desglose es el proveedor; de ahí el nombre.)
 */
function SupplierBreakdownCharts({
  results,
  suppliers,
  filters,
  selectedFilter,
}: Readonly<SupplierBreakdownChartsProps>) {
  const entityNames = useMemo(() => {
    const names = new Map<number, string>()
    suppliers.forEach((supplier) => {
      if (supplier.id !== undefined && supplier.name !== undefined) {
        names.set(supplier.id, supplier.name)
      }
    })
    return names
  }, [suppliers])

  const copy: EntityBreakdownCopy = useMemo(
    () => ({
      entity: 'Proveedor',
      totalLabel: 'Total Compras',
      monthlyTitle: 'Distribución Mensual de Pagos a Proveedores',
      overviewTitle: 'Panorama General de Pagos a Proveedores',
      perEntityTitle: 'Distribución Mensual de Pagos por Proveedor',
      dailyTitle: 'Distribución Diaria por Mes y Proveedor',
      tableTitle: 'Detalle Mensual por Proveedor',
      tableFirstColumnLabel: 'Mes / Proveedor',
      csvTitle: 'Reporte Mensual - Proveedores',
      // El nombre lleva el período (antes: Date.now(), que no decía nada y hacía
      // que dos exportaciones del mismo rango no se pudieran comparar por nombre).
      csvFilename: `Reporte_Proveedores_${filters.startDate}_${filters.endDate}.csv`,
    }),
    [filters.startDate, filters.endDate],
  )

  return (
    <EntityBreakdownCharts
      results={results}
      entityIdOf={personIdOf}
      entityNames={entityNames}
      filters={filters}
      selectedFilter={selectedFilter}
      copy={copy}
    />
  )
}

export default React.memo(SupplierBreakdownCharts)
