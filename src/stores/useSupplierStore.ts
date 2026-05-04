import Person from '../types/Person'
import { personService } from '../services/PersonService'
import { createEntityStore } from './createEntityStore'
import { UseBoundStore, StoreApi } from 'zustand'
import { EntityStore } from '../types/StoreTypes'

type SupplierStore = UseBoundStore<StoreApi<EntityStore<Person, 'suppliers'>>>

export const useSupplierStore: SupplierStore = createEntityStore<Person, 'suppliers'>('suppliers', personService)
