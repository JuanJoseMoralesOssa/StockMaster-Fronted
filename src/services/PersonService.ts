import Person from '../types/Person'

import { ApiService } from './ApiService'

export class PersonService extends ApiService<Person> {
    constructor() {
        super('people')
    }

    // Métodos específicos para proveedores
}
export const personService = new PersonService()
