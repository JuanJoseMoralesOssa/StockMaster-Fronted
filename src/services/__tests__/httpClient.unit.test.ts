import MockAdapter from 'axios-mock-adapter'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { configureHttpClient, httpClient } from '../httpClient'

describe('httpClient', () => {
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(httpClient)
  })

  afterEach(() => {
    mock.restore()
    configureHttpClient({ onUnauthenticated: undefined })
  })

  it('sends cookies with every request', () => {
    expect(httpClient.defaults.withCredentials).toBe(true)
  })

  it('does not inject an Authorization header', async () => {
    mock.onGet('/secure').reply(config => {
      expect(config.headers?.Authorization).toBeUndefined()
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
  })

  it('does not notify the app on permission errors', async () => {
    const onUnauthenticated = vi.fn()
    configureHttpClient({ onUnauthenticated })

    mock.onGet('/admin-only').reply(403, { message: 'Acceso denegado' })

    await expect(httpClient.get('/admin-only')).rejects.toBeTruthy()
    expect(onUnauthenticated).not.toHaveBeenCalled()
  })
})
