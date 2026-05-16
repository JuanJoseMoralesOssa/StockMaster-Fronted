import Person from '../types/Person'
import { PaginatedResponse } from '../types/PaginatedResponse'
import { ApiService } from './ApiService'
import { httpClient } from './httpClient'

export interface PersonFilters {
    name: string
}

export class PersonService extends ApiService<Person> {
    constructor() {
        super('people')
    }

    // Método específico para obtener personas paginadas
    async getAllPaginated(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Person>> {
        return this.getPaginated(page, limit)
    }

    async getAllPaginatedFiltered(
        filters: PersonFilters,
        page: number = 1,
        limit: number = 10
    ): Promise<PaginatedResponse<Person>> {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            })

            const name = filters.name.trim()
            if (name) {
                params.append('name', name)
            }

            return await this.handleResponse<PaginatedResponse<Person>>(
                httpClient.get(`${this.getUrl()}/filtered?${params.toString()}`)
            )
        } catch (error) {
            this.handleError(error, 'Error getting paginated people with filters')
        }
    }
}
export const personService = new PersonService()
