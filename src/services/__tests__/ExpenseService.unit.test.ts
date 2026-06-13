import MockAdapter from 'axios-mock-adapter'
import { ExpenseService } from '../ExpenseService'
import Expense from '../../types/Expense'
import { httpClient } from '../httpClient'

describe('ExpenseService Unit Tests', () => {
  let mock: MockAdapter
  let service: ExpenseService

  beforeEach(() => {
    mock = new MockAdapter(httpClient)
    service = new ExpenseService()
  })

  afterEach(() => {
    mock.reset()
  })

  it('updateWithDetails should strip UI flags, filter deleted records, and drop negative IDs', async () => {
    const payload = {
      id: 1,
      version: 5,
      date: '2026-03-01',
      total_kg: 50,
      expense_details: [
        { id: 10, weight_kg: 20, productId: 1, toDelete: true }, // should be removed
        { id: 11, weight_kg: 10, productId: 2, toUpdate: true }, // updated row, UI flag stripped
        { id: -99, weight_kg: 20, productId: 3, toCreate: true } // new row, negative id should be deleted, flag stripped
      ]
    }

    mock.onPut(`${service.buildUrl()}/with-details`).reply(config => {
      type Detail = { productId: number; id?: number; toUpdate?: boolean; toCreate?: boolean }
      const data = JSON.parse(config.data) as { expenseDetails: Detail[]; version?: number }
      expect(data.expenseDetails).toHaveLength(2)

      const updatedDetail = data.expenseDetails.find((d: Detail) => d.productId === 2)
      expect(updatedDetail?.id).toBe(11)
      expect((updatedDetail as Detail).toUpdate).toBeUndefined()

      const newDetail = data.expenseDetails.find((d: Detail) => d.productId === 3)
      expect(newDetail?.id).toBeUndefined()
      expect((newDetail as Detail).toCreate).toBeUndefined()

      expect(data.version).toBe(5)
      return [200, { ...payload, version: 6, expense_details: data.expenseDetails }]
    })

    const res = await service.updateWithDetails(payload as unknown as Expense)
    expect(res.version).toBe(6)
  })

  it('updateWithDetails should correctly surface 409 Conflict application errors', async () => {
    const payload = {
      id: 1,
      version: 2,
      date: '2026-03-01',
      expense_details: []
    }

    mock.onPut(`${service.buildUrl()}/with-details`).reply(409, {
      error: {
        message: 'Este registro fue modificado por otro usuario. Por favor recarga y vuelve a intentarlo.'
      }
    })

    await expect(service.updateWithDetails(payload as unknown as Expense)).rejects.toThrow(
      'Este registro fue modificado por otro usuario. Por favor recarga y vuelve a intentarlo.'
    )
  })

  it('delete should send the current expense version', async () => {
    mock.onDelete(`${service.buildUrl('1')}?version=5`).reply(204)

    await expect(service.delete(1, { id: 1, version: 5, date: '2026-03-01' })).resolves.toBeUndefined()
  })
})
