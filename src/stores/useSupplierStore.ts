import Person from '../types/Person'
import { personService } from '../services/PersonService'
import { createEntityStore } from './createEntityStore'

export const useSupplierStore = createEntityStore<Person, 'suppliers'>('suppliers', personService)
