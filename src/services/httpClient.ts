import axios, { AxiosError, AxiosHeaders } from 'axios'
import { AppConfig, Config } from '../config/Config'

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
    try {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers = AxiosHeaders.from({
          ...(config.headers ?? {}),
          Authorization: `Bearer ${token}`,
        })
      }
    } catch {
      // Ignorar errores de acceso a storage (por ejemplo en entornos sin window)
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
      try {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      } catch {
        // Ignorar si no se puede limpiar el storage
      }

      unauthenticatedHandler?.()
    }

    return Promise.reject(error)
  },
)

export { httpClient }
