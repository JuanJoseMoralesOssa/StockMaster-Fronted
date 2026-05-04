import Expense from '../types/Expense'
import ExpenseDetails from '../types/ExpenseDetails'
import { DocumentWithDetailsService } from './DocumentWithDetailsService'

export class ExpenseService extends DocumentWithDetailsService<Expense, ExpenseDetails> {
  constructor() {
    super({
      endpoint: 'expenses',
      payloadDetailsKey: 'expenseDetails',
      entityDetailsKey: 'expense_details',
      entityLabel: 'gasto',
    })
  }
}

export const expenseService = new ExpenseService()
