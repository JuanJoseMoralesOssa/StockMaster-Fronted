import { getCurrentMonthRange } from '@/utils/date'
import type { KardexFilters } from '@/types/Kardex'

export type { KardexFilters }

/** Operaciones de kardex (valores que entiende el backend). */
export const KARDEX_OPERATION_OPTIONS = [
  { value: 1, label: 'Entrada' },
  { value: 2, label: 'Salida' },
  { value: 3, label: 'Kardex' },
]

/** Filtros iniciales de kardex: mes en curso, sin producto ni operación. */
export function buildInitialKardexFilters(): KardexFilters {
  const { startDate, endDate } = getCurrentMonthRange()

  return {
    startDate,
    endDate,
    productId: '',
    productName: '',
    operation: '',
    balanceRecord: '',
    activeDate: false,
  }
}
