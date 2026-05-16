import MockAdapter from 'axios-mock-adapter'
import { httpClient } from '../httpClient'
import { PersonService } from '../PersonService'

describe('PersonService Unit Tests', () => {
  let mock: MockAdapter
  let service: PersonService

  beforeEach(() => {
    mock = new MockAdapter(httpClient)
    service = new PersonService()
  })

  afterEach(() => {
    mock.reset()
  })

  it('getAllPaginatedFiltered should send trimmed supplier name', async () => {
    mock.onGet(new RegExp(`${service.buildUrl()}/filtered\\?`)).reply(200, {
      count: 0,
      data: [],
      page: 1,
      limit: 10,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    })

    await service.getAllPaginatedFiltered({ name: '  Distribuidora ABC  ' }, 2, 25)

    expect(mock.history.get[0].url).toContain('page=2')
    expect(mock.history.get[0].url).toContain('limit=25')
    expect(mock.history.get[0].url).toContain('name=Distribuidora+ABC')
  })
})
