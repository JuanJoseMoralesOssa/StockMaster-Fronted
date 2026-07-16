import axios, { AxiosError } from 'axios'
import { AppConfig, Config } from '../config/Config'

type UnauthenticatedHandler = () => void

const httpClient = axios.create({
  timeout: AppConfig.requestTimeout,
  headers: Config.defaultConfig.headers,
  withCredentials: true,
})

let unauthenticatedHandler: UnauthenticatedHandler | null = null

export function configureHttpClient(options: { onUnauthenticated?: UnauthenticatedHandler } = {}) {
  unauthenticatedHandler = options.onUnauthenticated ?? null
}

// Interceptor de respuesta: 401 invalida la sesión; 403 se muestra como error de permisos.
// La sesión vive en una cookie httpOnly gestionada por el backend, así que acá
// no hay nada local que limpiar: solo se notifica a la app.
httpClient.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    const status = error.response?.status
    if (status === 401) {
      unauthenticatedHandler?.()
    }

    return Promise.reject(error)
  },
)

export { httpClient }
