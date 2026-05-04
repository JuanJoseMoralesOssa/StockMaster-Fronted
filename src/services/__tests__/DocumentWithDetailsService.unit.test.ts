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
