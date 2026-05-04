import MockAdapter from 'axios-mock-adapter'
import { PurchaseService } from '../PurchaseService'
import Purchase from '../../types/Purchase'
import { httpClient } from '../httpClient'

describe('PurchaseService Unit Tests', () => {
  let mock: MockAdapter
  let service: PurchaseService

  beforeEach(() => {
    mock = new MockAdapter(httpClient)
    service = new PurchaseService()
  })

  afterEach(() => {
    mock.reset()
  })

  it('updateWithDetails should strip UI flags, filter deleted records, and drop negative IDs', async () => {
    const payload = {
      id: 1,
      version: 2,
      date: '2026-03-01',
      total_kg: 50,
      purchase_details: [
        { id: 10, weight_kg: 20, productId: 1, personId: 1 }, // normal
        { id: 11, weight_kg: 10, productId: 2, personId: 1, toDelete: true, toUpdate: false }, // should be removed
        { id: -15, weight_kg: 30, productId: 3, personId: 1, toCreate: true } // new row, negative id should be deleted, flag stripped
      ]
    }

    mock.onPut(`${service.buildUrl()}/with-details`).reply(config => {
      type Detail = { productId: number; id?: number; toDelete?: boolean; toUpdate?: boolean; toCreate?: boolean }
      const data = JSON.parse(config.data) as { purchaseDetails: Detail[]; version?: number }
      // Validate the body contains cleaned details
      expect(data.purchaseDetails).toHaveLength(2)

      const normalDetail = data.purchaseDetails.find((d: Detail) => d.productId === 1)
      expect(normalDetail?.id).toBe(10)
      expect((normalDetail as Detail).toDelete).toBeUndefined()
      expect((normalDetail as Detail).toUpdate).toBeUndefined()

      const newDetail = data.purchaseDetails.find((d: Detail) => d.productId === 3)
      expect(newDetail?.id).toBeUndefined() // Negative ID stripped
      expect((newDetail as Detail).toCreate).toBeUndefined()

      expect(data.version).toBe(2)
      return [200, { ...payload, version: 3, purchase_details: data.purchaseDetails }]
    })

    const res = await service.updateWithDetails(payload as unknown as Purchase)
    expect(res.version).toBe(3)
  })

  it('updateWithDetails should correctly surface 409 Conflict application errors', async () => {
    const payload = {
      id: 1,
      version: 2,
      date: '2026-03-01',
      purchase_details: []
    }

    mock.onPut(`${service.buildUrl()}/with-details`).reply(409, {
      error: {
        message: 'Este registro fue modificado por otro usuario. Por favor recarga y vuelve a intentarlo.'
      }
    })

    await expect(service.updateWithDetails(payload as unknown as Purchase)).rejects.toThrow(
      'Este registro fue modificado por otro usuario. Por favor recarga y vuelve a intentarlo.'
    )
  })
})
