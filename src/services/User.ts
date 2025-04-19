import User from '../types/User'
import { ApiService } from './ApiService'

export class UserService extends ApiService<User> {
    constructor() {
        super('users')
    }

    // Métodos específicos para proveedores
}
export const userService = new UserService()
