export interface ErrorInfo {
  /** El mejor mensaje legible disponible; apto para mostrarse tal cual. */
  message?: string
  /** Status HTTP. Solo existe si el servidor llegó a responder. */
  status?: number
  /**
   * El mensaje que vino del CUERPO de la respuesta del backend, si lo hubo.
   * Se distingue de `message` a propósito: un llamador con un mensaje propio
   * ("Error al crear la compra") quiere preferir el suyo ante un fallo de red,
   * pero jamás ante un mensaje real del backend.
   */
  backendMessage?: string
  /** La petición expiró antes de recibir respuesta. */
  isTimeout: boolean
  /** La petición nunca llegó al servidor. */
  isNetwork: boolean
}

/** LoopBack4 envuelve el error en `{ error: { message } }`; toleramos el plano. */
type ResponseBody = { error?: { message?: string }; message?: string } | undefined

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : undefined

const asString = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined

/**
 * Detección por FORMA, no por `axios.isAxiosError`. Un rechazo que trae
 * `response.data` dice inequívocamente "el servidor respondió esto", tenga o no
 * el flag interno de axios (que se pierde al serializar el error o al re-envolverlo).
 */
function readResponse(error: unknown): { status?: number; body: ResponseBody } | undefined {
  const response = asRecord(asRecord(error)?.response)
  if (!response) return undefined

  return {
    status: typeof response.status === 'number' ? response.status : undefined,
    body: asRecord(response.data) as ResponseBody,
  }
}

/**
 * Los reintentos de red se disparan también con errores que NO son AxiosError
 * (un `Error` plano al que alguien le pegó `code`), así que la detección de
 * transporte mira `code`/`message` en cualquier error.
 */
function readTransportFlags(error: unknown): { isTimeout: boolean; isNetwork: boolean } {
  const record = asRecord(error)
  const code = asString(record?.code) ?? ''
  const message = asString(record?.message) ?? ''

  return {
    isTimeout: code === 'ECONNABORTED' || /timeout/i.test(message),
    isNetwork: code === 'ERR_NETWORK' || message === 'Network Error',
  }
}

/**
 * Normaliza cualquier error (de axios o no) a una forma única. Es la ÚNICA fuente
 * de verdad del parseo de errores: los servicios, useApiRequest y los formularios
 * la comparten para que los mensajes no se desincronicen entre capas.
 */
export function extractErrorInfo(error: unknown): ErrorInfo {
  const transport = readTransportFlags(error)
  const ownMessage = asString(asRecord(error)?.message)

  const response = readResponse(error)
  if (response) {
    const backendMessage = response.body?.error?.message || response.body?.message
    return {
      ...transport,
      message: backendMessage || ownMessage,
      status: response.status,
      backendMessage: backendMessage || undefined,
    }
  }

  // La petición salió pero nadie contestó (servidor caído, DNS, CORS).
  if (asRecord(error)?.request) {
    return { ...transport, message: 'No se recibió respuesta del servidor' }
  }

  if (typeof error === 'string') return { ...transport, message: error }
  return { ...transport, message: ownMessage }
}
