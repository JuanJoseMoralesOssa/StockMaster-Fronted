import PurchaseDetails from '../types/PurchaseDetails'
import { ApiService } from './ApiService'

export class PurchaseDetailsService extends ApiService<PurchaseDetails> {
    constructor() {
        super('purchase-details')
    }

}
export const purchaseDetailsService = new PurchaseDetailsService()
