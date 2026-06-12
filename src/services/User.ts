import User from '../types/User'
import { PaginatedResponse } from '../types/PaginatedResponse'
import { ApiService } from './ApiService'
import { httpClient } from './httpClient'

export interface UserFilters {
    name: string
    email: string
    role: string
}

export class UserService extends ApiService<User> {
    constructor() {
        super('users', 'usuarios')
    }

    // Método específico para obtener usuarios paginados
    async getAllPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResponse<User>> {
        return this.getPaginated(page, limit)
    }

    async getAllPaginatedFiltered(
        filters: UserFilters,
        page: number = 1,
        limit: number = 10
    ): Promise<PaginatedResponse<User>> {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            })

            const name = filters.name.trim()
            const email = filters.email.trim()
            const role = filters.role.trim()

            if (name) {
                params.append('name', name)
            }
            if (email) {
                params.append('email', email)
            }
            if (role) {
                params.append('role', role)
            }

            return await this.handleResponse<PaginatedResponse<User>>(
                httpClient.get(`${this.getUrl()}/filtered?${params.toString()}`)
            )
        } catch (error) {
            this.handleError(error, 'Error al obtener usuarios filtrados')
        }
    }
}
export const userService = new UserService()
