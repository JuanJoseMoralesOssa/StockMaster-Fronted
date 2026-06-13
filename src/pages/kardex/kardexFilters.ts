import { getCurrentMonthRange } from '@/utils/date'
import type { KardexFilters } from '@/types/Kardex'

export type { KardexFilters }

/** Operaciones de kardex (valores que entiende el backend). */
export const KARDEX_OPERATION_OPTIONS = [
  { value: 1, label: 'Compra aplicada' },
  { value: 2, label: 'Compra revertida' },
  { value: 3, label: 'Gasto aplicado' },
  { value: 4, label: 'Gasto revertido' },
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
    activeDate: false,
  }
}
