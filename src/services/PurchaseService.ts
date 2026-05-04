import Purchase from '../types/Purchase'
import PurchaseDetails from '../types/PurchaseDetails'
import { DocumentWithDetailsService } from './DocumentWithDetailsService'

export class PurchaseService extends DocumentWithDetailsService<Purchase, PurchaseDetails> {
  constructor() {
    super({
      endpoint: 'purchases',
      payloadDetailsKey: 'purchaseDetails',
      entityDetailsKey: 'purchase_details',
      entityLabel: 'compra',
    })
  }
}

export const purchaseService = new PurchaseService()
