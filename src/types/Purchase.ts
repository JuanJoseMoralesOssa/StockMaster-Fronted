import Person from './Person'
import Product from './Product'
import PurchaseDetails from './PurchaseDetails'

export default interface Purchase {
  id?: number
  total_kg: number
  date: string // '2025-02-16T21:33:09.422Z'

  people?: Person[]
  products?: Product[]
  purchase_details?: PurchaseDetails[]
}
