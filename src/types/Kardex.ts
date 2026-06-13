import Product from './Product'

export default interface Kardex {
    id?: number
    date: string // '2025-02-16T21:33:09.422Z'
    input: number
    output: number
    balance: number
    operation: number
    productId: number
    sourceKind?: 'purchase' | 'expense'
    sourceId?: number
    sourceDetailId?: number
    userId?: number

    product?: Product
}

/** Filtros de búsqueda de kardex (los strings vienen de los inputs del formulario). */
export interface KardexFilters {
    startDate: string
    endDate: string
    productId: string
    productName: string
    operation: string
    activeDate: boolean
}
