import Payment from './Payment'
import Person from './Person'
import Product from './Product'

export default interface PaymentDetails {
  id?: number
  weight_kg?: number
  paymentId?: number
  productId?: number
  personId?: number

  payment?: Payment
  product?: Product
  person?: Person

  toUpdate?: boolean
  toDelete?: boolean
  toCreate?: boolean
}
