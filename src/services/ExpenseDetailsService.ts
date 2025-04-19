import ExpenseDetails from '../types/ExpenseDetails'

import { ApiService } from './ApiService'

export class ExpenseDetailsService extends ApiService<ExpenseDetails> {
    constructor() {
        super('expense-details')
    }

    // Métodos específicos para proveedores
}
export const expenseDetailsService = new ExpenseDetailsService()
