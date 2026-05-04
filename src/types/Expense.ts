import ExpenseDetails from './ExpenseDetails'
import Person from './Person'
import Product from './Product'

export default interface Expense {
  id?: number
  version?: number
  total_kg?: number
  date: string // '2025-02-16T21:33:09.422Z'

  people?: Person[]
  products?: Product[]
  expense_details?: ExpenseDetails[]
}
