export interface PaginatedResponse<T> {
    count: number
    data: T[]
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
}
