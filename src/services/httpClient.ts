import axios, { AxiosError, AxiosHeaders } from 'axios'
import { AppConfig, Config } from '../config/Config'
import { tokenStorage } from './tokenStorage'

type UnauthenticatedHandler = () => void

const httpClient = axios.create({
  timeout: AppConfig.requestTimeout,
  headers: Config.defaultConfig.headers,
})

let unauthenticatedHandler: UnauthenticatedHandler | null = null

export function configureHttpClient(options: { onUnauthenticated?: UnauthenticatedHandler } = {}) {
  unauthenticatedHandler = options.onUnauthenticated ?? null
}

// Interceptor de request: adjunta el token JWT si existe
httpClient.interceptors.request.use(
  config => {
    const token = tokenStorage.getToken()
    if (token) {
      config.headers = AxiosHeaders.from({
        ...(config.headers ?? {}),
        Authorization: `Bearer ${token}`,
      })
    }
    return config
  },
  error => Promise.reject(error),
)

// Interceptor de respuesta: manejo global básico de 401/403
httpClient.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    const status = error.response?.status
    if (status === 401 || status === 403) {
      tokenStorage.clear()
      unauthenticatedHandler?.()
    }

    return Promise.reject(error)
  },
)

export { httpClient }
