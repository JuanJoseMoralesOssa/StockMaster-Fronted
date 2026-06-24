// @vitest-environment jsdom
import axios, { AxiosHeaders } from 'axios'
import { describe, expect, it } from 'vitest'

describe('Axios browser FormData headers', () => {
  it('should inspect headers', async () => {
    const client = axios.create({ headers: { 'Content-Type': 'application/json' } })
    let finalHeader: unknown

    client.interceptors.request.use(config => {
      const headers = AxiosHeaders.from(config.headers)
      finalHeader = headers.get('Content-Type')
      return Promise.reject(new Error('stop'))
    })

    await expect(
      client.post('/test', new FormData(), {
        headers: { 'Content-Type': undefined },
      }),
    ).rejects.toThrow('stop')

    expect(finalHeader).not.toBe('application/json')
  })
})
