import { getCurrentMonthRange } from '@/utils/date'
import type { KardexFilters } from '@/types/Kardex'

export type { KardexFilters }

/** Operaciones de kardex (valores que entiende el backend). */
export const KARDEX_OPERATION_OPTIONS = [
  { value: 1, label: 'Compra aplicada' },
  { value: 2, label: 'Compra revertida' },
  { value: 3, label: 'Pago aplicado' },
  { value: 4, label: 'Pago revertido' },
  { value: 5, label: 'Balance inicial' },
  { value: 6, label: 'Ajuste manual' },
]

/** Valor de operación del ajuste manual de inventario (KardexOperation.Manual en el backend). */
export const KARDEX_OPERATION_MANUAL = 6

/** Filtros iniciales de kardex: mes en curso, sin producto ni operación. */
export function buildInitialKardexFilters(): KardexFilters {
  const { startDate, endDate } = getCurrentMonthRange()

  return {
    startDate,
    endDate,
    productId: '',
    productName: '',
    operation: '',
    activeDate: false,
  }
}
