import Person from '../types/Person'
import { PaginatedResponse } from '../types/PaginatedResponse'
import { ApiService } from './ApiService'

export class PersonService extends ApiService<Person> {
    constructor() {
        super('people')
    }

    // Método específico para obtener personas paginadas
    async getAllPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Person>> {
        return this.getPaginated(page, limit)
    }

    // Métodos específicos para personas si los necesitas...
}
export const personService = new PersonService()
