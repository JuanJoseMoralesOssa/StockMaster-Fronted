import Payment from './Payment'
import Kardex from './Kardex'
import Person from './Person'
import Purchase from './Purchase'

export default interface Product {
  id?: number
  name: string
  balance?: number
  // description: string
  // createdAt: string

  purchases?: Purchase[]
  payments?: Payment[]
  kardexes?: Kardex[]
  people_purchase_details?: Person[]
  people_payment_details?: Person[]
}
