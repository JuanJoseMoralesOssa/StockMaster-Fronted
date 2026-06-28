import Payment from '../types/Payment'
import PaymentDetails from '../types/PaymentDetails'
import { DocumentWithDetailsService } from './DocumentWithDetailsService'

export class PaymentService extends DocumentWithDetailsService<Payment, PaymentDetails> {
  constructor() {
    super({
      endpoint: 'payments',
      payloadDetailsKey: 'paymentDetails',
      entityDetailsKey: 'payment_details',
      entityLabel: 'pago',
    })
  }
}

export const paymentService = new PaymentService()
