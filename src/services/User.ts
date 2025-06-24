import User from '../types/User'
import { PaginatedResponse } from '../types/PaginatedResponse'
import { ApiService } from './ApiService'

export class UserService extends ApiService<User> {
    constructor() {
        super('users')
    }

    // Método específico para obtener usuarios paginados
    async getAllPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResponse<User>> {
        return this.getPaginated(page, limit)
    }

    // Métodos específicos para proveedores
}
export const userService = new UserService()
