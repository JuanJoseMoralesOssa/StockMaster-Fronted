import { useCallback } from 'react'
import {
  EXTRACTION_HTTP_TIMEOUT_MS,
  formExtractionService,
} from '../../../../services/FormExtractionService'
import type {
  ScanImageCrop,
  ScanImageOptimizationResult,
} from '../../../../services/scanImagePreprocessor'
import type { ExtractionResult } from '../../../../types/FormExtraction'
import { extractErrorInfo } from '../../../../utils/error'

/**
 * Último escalón de la escalera: la UI se rinde solo después del timeout HTTP,
 * que a su vez espera más que el presupuesto del backend. Si la UI cortara
 * primero abortaríamos —y pagaríamos— una cadena de modelos que aún podía
 * responder (ver FormExtractionService).
 *
 *     presupuesto backend  <  timeout HTTP  <  timeout de UI
 */
export const EXTRACTION_UI_TIMEOUT_MS = EXTRACTION_HTTP_TIMEOUT_MS + 2000

/**
 * El spinner tiene que verse un mínimo. Si la respuesta llega en 80 ms, aparecer
 * y desaparecer se lee como un parpadeo roto, no como "ya está".
 */
const MIN_PROCESSING_VISIBLE_MS = 700

const TIMEOUT_MESSAGE =
  'El escaneo está tardando demasiado. Intenta de nuevo en unos segundos.'
const FALLBACK_ERROR_MESSAGE =
  'No se pudo leer el formulario. Intenta con otra foto.'

/**
 * Los tres finales posibles de un escaneo. Antes esto se codificaba como
 * `resultado | null | Symbol` y el mensaje de error se sacaba de contrabando por
 * un ref, así que quien leía el código tenía que reconstruir a mano qué
 * significaba cada combinación.
 */
export type ExtractionOutcome =
  | { status: 'ok'; result: ExtractionResult }
  | { status: 'timeout'; message: string }
  | { status: 'error'; message: string }

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

interface UseFormExtractionOptions {
  /** Recibe la imagen ya optimizada que realmente viajó al servidor. */
  onOptimizedImage: (optimized: ScanImageOptimizationResult) => void
}

/**
 * Envía la foto del formulario al backend y espera la lectura, corriendo la
 * petición contra un timeout de UI. Si el timeout gana, aborta la petición en
 * vuelo: dejarla viva seguiría gastando cuota de Gemini en una respuesta que ya
 * nadie va a leer.
 */
export function useFormExtraction({ onOptimizedImage }: UseFormExtractionOptions) {
  const extract = useCallback(
    async (file: File, crop?: ScanImageCrop): Promise<ExtractionOutcome> => {
      const startedAt = Date.now()
      const abortController = new AbortController()

      const timedOut = Symbol('extraction-timeout')
      let timeoutId: ReturnType<typeof setTimeout> | undefined
      const timeout = new Promise<typeof timedOut>((resolve) => {
        timeoutId = setTimeout(() => resolve(timedOut), EXTRACTION_UI_TIMEOUT_MS)
      })

      const attempt: Promise<ExtractionOutcome> = formExtractionService
        .extractFromImage(file, {
          crop,
          signal: abortController.signal,
          onOptimizedImage,
        })
        .then((result): ExtractionOutcome => ({ status: 'ok', result }))
        .catch((error): ExtractionOutcome => {
          // Si ya abortamos, el rechazo es la consecuencia del timeout, no una
          // causa nueva: informar el timeout y no un críptico "canceled".
          if (abortController.signal.aborted) {
            return { status: 'timeout', message: TIMEOUT_MESSAGE }
          }
          return {
            status: 'error',
            message: extractErrorInfo(error).message ?? FALLBACK_ERROR_MESSAGE,
          }
        })

      const outcome = await Promise.race([attempt, timeout])
      if (timeoutId) clearTimeout(timeoutId)

      await wait(Math.max(0, MIN_PROCESSING_VISIBLE_MS - (Date.now() - startedAt)))

      if (outcome === timedOut) {
        abortController.abort()
        return { status: 'timeout', message: TIMEOUT_MESSAGE }
      }
      return outcome
    },
    [onOptimizedImage],
  )

  return { extract }
}
