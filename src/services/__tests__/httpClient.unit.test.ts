import MockAdapter from 'axios-mock-adapter'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { configureHttpClient, httpClient } from '../httpClient'

describe('httpClient', () => {
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(httpClient)
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => 'test-token'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    })
  })

  afterEach(() => {
    mock.restore()
    vi.unstubAllGlobals()
    configureHttpClient({ onUnauthenticated: undefined })
  })

  it('adds the Authorization header from localStorage', async () => {
    mock.onGet('/secure').reply(config => {
      expect(config.headers?.Authorization).toBe('Bearer test-token')
      return [200, { ok: true }]
    })

    const response = await httpClient.get('/secure')
    expect(response.data).toEqual({ ok: true })
  })

  it('notifies the app when the session expires', async () => {
    const onUnauthenticated = vi.fn()
    configureHttpClient({ onUnauthenticated })

    mock.onGet('/secure').reply(401, { message: 'Unauthorized' })

    await expect(httpClient.get('/secure')).rejects.toBeTruthy()
    expect(onUnauthenticated).toHaveBeenCalledTimes(1)
    expect(localStorage.removeItem).toHaveBeenCalledWith('token')
    expect(localStorage.removeItem).toHaveBeenCalledWith('user')
  })
})
