import axios, { AxiosError } from 'axios'

export function extractErrorInfo(error: unknown): { message?: string; status?: number } {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError
    if (axiosError.response) {
      const status = axiosError.response.status
      type RespData = { error?: { message?: string }; message?: string }
      const data = axiosError.response.data as RespData | undefined
      const message = data?.error?.message || data?.message || axiosError.message
      return { message, status }
    }
    if (axiosError.request) {
      return { message: 'No se recibió respuesta del servidor' }
    }
    return { message: axiosError.message }
  }

  if (typeof error === 'string') return { message: error }
  if (error && typeof error === 'object' && 'message' in error) {
    return { message: (error as { message?: string }).message }
  }
  return {}
}
