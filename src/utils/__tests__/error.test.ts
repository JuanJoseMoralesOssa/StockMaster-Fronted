import { AxiosError, AxiosHeaders } from 'axios'
import { describe, expect, it } from 'vitest'
import { extractErrorInfo } from '../error'

const config = { headers: new AxiosHeaders() }

/** AxiosError que SÍ llegó al servidor y volvió con un status. */
const withResponse = (status: number, data: unknown, message = 'Request failed') =>
  new AxiosError(message, 'ERR_BAD_RESPONSE', config, {}, {
    status,
    statusText: '',
    data,
    headers: new AxiosHeaders(),
    config,
  })

describe('extractErrorInfo', () => {
  it('prefers the nested backend message (LoopBack error envelope)', () => {
    const error = withResponse(422, { error: { message: 'weight_kg debe ser > 0' } })

    expect(extractErrorInfo(error)).toMatchObject({
      message: 'weight_kg debe ser > 0',
      status: 422,
    })
  })

  it('falls back to a flat message field', () => {
    const error = withResponse(400, { message: 'Fecha inválida' })

    expect(extractErrorInfo(error)).toMatchObject({ message: 'Fecha inválida', status: 400 })
  })

  it('falls back to the axios message when the body carries none', () => {
    const error = withResponse(500, {}, 'Request failed with status code 500')

    expect(extractErrorInfo(error)).toMatchObject({
      message: 'Request failed with status code 500',
      status: 500,
    })
  })

  it('surfaces the 409 status so callers can detect a version conflict', () => {
    const error = withResponse(409, { error: { message: 'Version conflict' } })

    expect(extractErrorInfo(error).status).toBe(409)
  })

  it('reports a server that never answered, with no status', () => {
    const error = new AxiosError('Network Error', 'ERR_NETWORK', config, {})

    expect(extractErrorInfo(error)).toMatchObject({
      message: 'No se recibió respuesta del servidor',
    })
  })

  it('returns the axios message when the request was never even sent', () => {
    const error = new AxiosError('Something broke while setting up', 'ERR_BAD_OPTION', config)

    expect(extractErrorInfo(error)).toMatchObject({ message: 'Something broke while setting up' })
  })

  it('accepts a bare string', () => {
    expect(extractErrorInfo('algo falló')).toMatchObject({ message: 'algo falló' })
  })

  it('accepts a plain Error', () => {
    expect(extractErrorInfo(new Error('boom'))).toMatchObject({ message: 'boom' })
  })

  it('accepts any object carrying a message', () => {
    expect(extractErrorInfo({ message: 'raro pero legible' })).toMatchObject({
      message: 'raro pero legible',
    })
  })

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['a number', 42],
  ])('yields no message and no status for %s', (_name, value) => {
    const info = extractErrorInfo(value)

    expect(info.message).toBeUndefined()
    expect(info.status).toBeUndefined()
  })
})

// `backendMessage` es el mensaje que vino del CUERPO de la respuesta, y se
// distingue de `message` a propósito: un llamador con un mensaje propio ("Error al
// crear la compra") quiere preferir el suyo ante un fallo de red, pero jamás ante
// un mensaje real del backend.
describe('extractErrorInfo — backendMessage', () => {
  it('exposes a body message as backendMessage', () => {
    const info = extractErrorInfo(withResponse(422, { error: { message: 'peso inválido' } }))

    expect(info.backendMessage).toBe('peso inválido')
  })

  it('leaves backendMessage undefined when the body carries no message', () => {
    const info = extractErrorInfo(withResponse(500, {}, 'Request failed with status code 500'))

    expect(info.backendMessage).toBeUndefined()
    expect(info.message).toBe('Request failed with status code 500')
  })

  it('leaves backendMessage undefined when the server never answered', () => {
    const info = extractErrorInfo(new AxiosError('Network Error', 'ERR_NETWORK', config, {}))

    expect(info.backendMessage).toBeUndefined()
    expect(info.message).toBe('No se recibió respuesta del servidor')
  })
})

describe('extractErrorInfo — transport flags', () => {
  it('flags an axios timeout by code', () => {
    const info = extractErrorInfo(new AxiosError('timeout of 25000ms exceeded', 'ECONNABORTED', config))

    expect(info.isTimeout).toBe(true)
    expect(info.isNetwork).toBe(false)
  })

  it('flags a timeout by message when the code is missing', () => {
    const info = extractErrorInfo(new Error('Timeout while waiting'))

    expect(info.isTimeout).toBe(true)
  })

  it('flags a network failure by code', () => {
    const info = extractErrorInfo(new AxiosError('Network Error', 'ERR_NETWORK', config, {}))

    expect(info.isNetwork).toBe(true)
    expect(info.isTimeout).toBe(false)
  })

  // useApiRequest reintenta ante fallos de red, y su test los simula con un Error
  // PLANO que lleva `code` — no un AxiosError. La detección no puede depender de
  // axios.isAxiosError o el reintento deja de dispararse.
  it('flags a network failure on a plain Error carrying the axios code', () => {
    const info = extractErrorInfo(Object.assign(new Error('Network Error'), { code: 'ERR_NETWORK' }))

    expect(info.isNetwork).toBe(true)
  })

  it('does not flag transport problems when the server answered', () => {
    const info = extractErrorInfo(withResponse(422, { error: { message: 'peso inválido' } }))

    expect(info.isTimeout).toBe(false)
    expect(info.isNetwork).toBe(false)
  })
})
