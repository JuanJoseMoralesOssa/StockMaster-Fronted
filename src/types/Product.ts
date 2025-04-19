import Expense from './Expense'
import Kardex from './Kardex'
import Person from './Person'
import Purchase from './Purchase'

export default interface Product {
  id?: number
  name: string
  stock?: number
  code?: string
  // description: string
  // createdAt: string

  purchases?: Purchase[]
  expenses?: Expense[]
  kardexes?: Kardex[]
  people_purchase_details?: Person[]
  people_expense_details?: Person[]
}
