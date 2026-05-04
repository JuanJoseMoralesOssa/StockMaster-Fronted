export interface DocumentDateFilters {
  startDate?: string
  endDate?: string
  personId?: string
  productId?: string
  activeDate: boolean
}

export type DocumentFilters = DocumentDateFilters
