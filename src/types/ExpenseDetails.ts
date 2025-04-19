import Expense from './Expense'
import Person from './Person'
import Product from './Product'

export default interface ExpenseDetails {
  id?: number
  weight_kg?: number
  expenseId?: number
  productId?: number
  personId?: number

  expense?: Expense
  product?: Product
  person?: Person

  toUpdate?: boolean
  toDelete?: boolean
  toCreate?: boolean
}
