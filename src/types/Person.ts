import Payment from './Payment'
import Product from './Product'
import Purchase from './Purchase'

export default interface Person {
    id?: number
    name: string

    payments?: Payment[]
    purchases?: Purchase[]
    products_payment_details?: Product[]
    products_purchase_details?: Product[]
}
