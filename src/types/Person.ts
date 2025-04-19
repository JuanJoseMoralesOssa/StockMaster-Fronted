import Expense from './Expense'
import Product from './Product'
import Purchase from './Purchase'

export default interface Person {
    id?: number
    name: string

    expenses?: Expense[]
    purchases?: Purchase[]
    products_expense_details?: Product[]
    products_purchase_details?: Product[]
}
