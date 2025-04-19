import Person from './Person'
import Product from './Product'
import Purchase from './Purchase'

export default interface PurchaseDetails {
  id?: number
  weight_kg?: number
  purchaseId?: number
  productId?: number
  personId?: number

  purchase?: Purchase
  product?: Product
  person?: Person

  toUpdate?: boolean
  toDelete?: boolean
  toCreate?: boolean
}
