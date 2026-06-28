import PaymentDetails from './PaymentDetails'
import Person from './Person'
import Product from './Product'

export default interface Payment {
  id?: number
  version?: number
  total_kg?: number
  date: string // '2025-02-16T21:33:09.422Z'

  people?: Person[]
  products?: Product[]
  payment_details?: PaymentDetails[]
}
