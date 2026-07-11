import { useCallback, useEffect, useRef, useState } from 'react'
import { extractErrorInfo } from '../utils/error'
import { useToast } from './useToast'

export interface UseApiRequestOptions<T> {
  /** Mensaje de éxito opcional (solo para operaciones de escritura) */
  successMessage?: string
  /** Mensaje de error genérico por defecto */
  errorMessage?: string
  /** Mostrar toast de éxito (por defecto false para lecturas) */
  showSuccessToast?: boolean
  /** Mostrar toast de error (por defecto true) */
  showErrorToast?: boolean
  /** Callback al recibir respuesta exitosa */
  onSuccess?: (data: T) => void
  /** Callback al fallar */
  onError?: (error: unknown) => void
  /** Re-lanzar el error después de actualizar estado/toasts. Útil para formularios que muestran errores inline. */
  throwOnError?: boolean
  /** Número máximo de reintentos en caso de fallo de red (por defecto 0) */
  maxRetries?: number
  /** Retardo base en ms para backoff exponencial (por defecto 500) */
  retryDelayMs?: number
}

export interface UseApiRequestState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

const areArgsEqual = <Args extends unknown[]>(left: Args, right: Args) =>
  left.length === right.length && left.every((value, index) => Object.is(value, right[index]))

/**
 * Hook genérico para manejar llamadas a servicios con:
 * - estado de carga
 * - manejo de errores HTTP (incluyendo mensajes del backend)
 * - toasts de error/éxito opcionales
 * - capacidad de reintento con los últimos parámetros
 */
export function useApiRequest<T, Args extends unknown[] = []>(
  requestFn: (...args: Args) => Promise<T>,
  {
    successMessage,
    errorMessage,
    showSuccessToast = false,
    showErrorToast = true,
    onSuccess,
    onError,
    throwOnError = false,
    maxRetries,
    retryDelayMs,
  }: UseApiRequestOptions<T> = {},
) {
  const [state, setState] = useState<UseApiRequestState<T>>({
    data: null,
    loading: false,
    error: null,
  })
  const [lastArgs, setLastArgs] = useState<Args | null>(null)
  const ongoing = useRef<{ args: Args; promise: Promise<T | null> } | null>(null)
  const requestIdRef = useRef(0)
  const latestRequestIdRef = useRef(0)
  const isMountedRef = useRef(true)

  const { showError, showSuccess } = useToast()

  useEffect(() => {
    // React StrictMode ejecuta setup/cleanup/setup en desarrollo.
    // Si no reactivamos esta bandera, execute() puede quedar retornando null.
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
      // Invalida respuestas en vuelo para evitar setState tras desmontar.
      latestRequestIdRef.current = Number.MAX_SAFE_INTEGER
      ongoing.current = null
    }
  }, [])

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      if (!isMountedRef.current) {
        return null
      }

      setLastArgs(args)

      if (ongoing.current && areArgsEqual(ongoing.current.args, args)) {
        return ongoing.current.promise
      }

      const requestId = ++requestIdRef.current
      latestRequestIdRef.current = requestId
      if (isMountedRef.current) {
        setState(prev => ({ ...prev, loading: true, error: null }))
      }

      const retries = Math.max(0, maxRetries ?? 0)
      const baseDelay = Math.max(0, retryDelayMs ?? 500)
      let attempt = 0

      const run = async (): Promise<T | null> => {
        try {
          const result = await requestFn(...args)

          if (isMountedRef.current && latestRequestIdRef.current === requestId) {
            setState({ data: result, loading: false, error: null })

            if (showSuccessToast && successMessage) {
              showSuccess(successMessage)
            }
            onSuccess?.(result)
          }

          return result
        } catch (error) {
          attempt += 1
          const { backendMessage, isTimeout, isNetwork } = extractErrorInfo(error)
          // Un mensaje real del backend siempre gana. Si el fallo fue de
          // transporte, el mensaje del llamador ("Error al crear la compra") es
          // más útil que el críptico "Network Error" de axios.
          const message = backendMessage
            ?? ((isTimeout || isNetwork) && errorMessage
              ? errorMessage
              : error instanceof Error
                ? error.message
                : errorMessage ?? 'Ha ocurrido un error al procesar la solicitud.')

          if (isNetwork && attempt <= retries) {
            const delay = baseDelay * Math.pow(2, attempt - 1)
            await new Promise(res => setTimeout(res, delay))
            return run()
          }

          if (isMountedRef.current && latestRequestIdRef.current === requestId) {
            setState(prev => ({ ...prev, loading: false, error: message }))

            if (showErrorToast) {
              showError(message)
            }
            onError?.(error)
          }

          if (throwOnError) {
            throw error
          }

          return null
        }
      }

      const promise = run().finally(() => {
        if (ongoing.current?.promise === promise) {
          ongoing.current = null
        }
      })

      ongoing.current = { args, promise }
      return await promise
    },
    [
      requestFn,
      showSuccessToast,
      successMessage,
      showErrorToast,
      errorMessage,
      showError,
      showSuccess,
      onSuccess,
      onError,
      throwOnError,
      maxRetries,
      retryDelayMs,
    ],
  )

  const retry = useCallback(async () => {
    if (!lastArgs) return null
    return execute(...lastArgs)
  }, [execute, lastArgs])

  const reset = useCallback(() => {
    if (!isMountedRef.current) {
      return
    }

    setState({ data: null, loading: false, error: null })
    setLastArgs(null)
  }, [])

  return {
    ...state,
    // Últimos args usados en la ejecución (útil para retry/telemetría)
    lastArgs,
    execute,
    retry,
    reset,
  }
}
