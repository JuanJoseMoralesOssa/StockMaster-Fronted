import MockAdapter from 'axios-mock-adapter'
import { httpClient } from '../httpClient'
import {
  DocumentWithDetailsService,
  DocumentWithDetailsService as BaseService,
} from '../DocumentWithDetailsService'
import { DocumentFilters } from '../../types/DocumentFilters'

type TestDetail = {
  id?: number
  weight_kg?: number
  productId?: number
  personId?: number
  toCreate?: boolean
  toUpdate?: boolean
  toDelete?: boolean
}

type TestDocument = {
  id?: number
  version?: number
  date?: string
  test_details?: TestDetail[]
}

class TestDocumentService extends DocumentWithDetailsService<TestDocument, TestDetail> {
  constructor() {
    super({
      endpoint: 'tests',
      payloadDetailsKey: 'testDetails',
      entityDetailsKey: 'test_details',
      entityLabel: 'documento',
    })
  }
}

describe('DocumentWithDetailsService Unit Tests', () => {
  let mock: MockAdapter
  let service: BaseService<TestDocument, TestDetail>

  beforeEach(() => {
    mock = new MockAdapter(httpClient)
    service = new TestDocumentService()
  })

  afterEach(() => {
    mock.reset()
  })

  it('updateWithDetails should strip UI flags, filter deleted records, and drop negative IDs', async () => {
    const payload: TestDocument = {
      id: 9,
      version: 3,
      date: '2026-03-05',
      test_details: [
        { id: 10, weight_kg: 10, productId: 1, toUpdate: true },
        { id: 11, weight_kg: 8, productId: 2, toDelete: true },
        { id: -1, weight_kg: 2, productId: 3, toCreate: true },
      ],
    }

    mock.onPut(`${service.buildUrl()}/with-details`).reply((config) => {
      const data = JSON.parse(config.data) as { testDetails: TestDetail[]; version: number }
      expect(data.testDetails).toHaveLength(2)
      expect(data.version).toBe(3)

      const updatedDetail = data.testDetails.find((detail) => detail.productId === 1)
      expect(updatedDetail?.toUpdate).toBeUndefined()

      const createdDetail = data.testDetails.find((detail) => detail.productId === 3)
      expect(createdDetail?.id).toBeUndefined()
      expect(createdDetail?.toCreate).toBeUndefined()

      return [200, { ...payload, version: 4, test_details: data.testDetails }]
    })

    const response = await service.updateWithDetails(payload)
    expect(response.version).toBe(4)
  })

  it('updateWithDetails coerces string weight_kg to a 3-decimal number and sends only contract fields', async () => {
    const payload: TestDocument = {
      id: 9,
      version: 3,
      date: '2026-03-05',
      test_details: [
        // Fila no editada: weight_kg llega como el STRING del numeric de Postgres.
        { id: 10, weight_kg: '8.000' as unknown as number, productId: 1, personId: 5, toUpdate: true },
        { id: 12, weight_kg: 1.23456, productId: 2, personId: 5 },
      ],
    }
    // Un FK del padre (purchaseId) NO debe llegar al backend.
    ;(payload.test_details![0] as Record<string, unknown>).purchaseId = 9

    mock.onPut(`${service.buildUrl()}/with-details`).reply((config) => {
      const data = JSON.parse(config.data) as { testDetails: Array<Record<string, unknown>> }

      const updated = data.testDetails.find((d) => d.productId === 1)!
      expect(typeof updated.weight_kg).toBe('number')
      expect(updated.weight_kg).toBe(8)
      expect(updated.id).toBe(10)
      expect(updated.purchaseId).toBeUndefined() // sin fuga
      expect(updated.toUpdate).toBeUndefined()

      const rounded = data.testDetails.find((d) => d.productId === 2)!
      expect(rounded.weight_kg).toBe(1.235) // redondeo a 3 decimales

      return [200, { ...payload, version: 4, test_details: data.testDetails }]
    })

    await service.updateWithDetails(payload)
  })

  it('createWithDetails coerces string weight_kg to a number', async () => {
    mock.onPost(`${service.buildUrl()}/with-details`).reply((config) => {
      const data = JSON.parse(config.data) as { testDetails: Array<Record<string, unknown>> }
      expect(typeof data.testDetails[0].weight_kg).toBe('number')
      expect(data.testDetails[0].weight_kg).toBe(12)
      return [200, {}]
    })

    await service.createWithDetails({
      date: '2026-03-01',
      test_details: [{ weight_kg: '12.000' as unknown as number, productId: 1, personId: 2 }],
    })
  })

  it('updateWithDetails should correctly surface 409 Conflict application errors', async () => {
    mock.onPut(`${service.buildUrl()}/with-details`).reply(409, {
      error: {
        message: 'Este registro fue modificado por otro usuario. Por favor recarga y vuelve a intentarlo.',
      },
    })

    await expect(
      service.updateWithDetails({ id: 1, version: 1, date: '2026-03-01', test_details: [] }),
    ).rejects.toThrow('Este registro fue modificado por otro usuario. Por favor recarga y vuelve a intentarlo.')
  })

  it('delete should send the row version as a query parameter', async () => {
    mock.onDelete(`${service.buildUrl('1')}?version=3`).reply(204)

    await expect(service.delete(1, { id: 1, version: 3 })).resolves.toBeUndefined()
  })

  it('delete should require the row version before calling the API', async () => {
    await expect(service.delete(1, { id: 1 })).rejects.toThrow('falta la versión')
    expect(mock.history.delete).toHaveLength(0)
  })

  it('createWithDetails should require at least one detail', async () => {
    await expect(
      service.createWithDetails({ date: '2026-03-01', test_details: [] }),
    ).rejects.toThrow('El documento debe tener al menos un detalle')
  })

  it('getAllPaginatedFiltered should send active filters only when enabled', async () => {
    const filters: DocumentFilters = {
      activeDate: true,
      startDate: '2026-03-01',
      endDate: '2026-03-30',
      personId: '1',
      productId: '2',
    }

    mock.onGet(new RegExp(`${service.buildUrl()}/filtered\\?`)).reply(200, {
      count: 0,
      data: [],
      page: 1,
      limit: 10,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    })

    await service.getAllPaginatedFiltered(filters)

    expect(mock.history.get[0].url).toContain('startDate=2026-03-01')
    expect(mock.history.get[0].url).toContain('endDate=2026-03-30')
    expect(mock.history.get[0].url).toContain('personId=1')
    expect(mock.history.get[0].url).toContain('productId=2')
  })
})
