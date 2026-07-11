import { useCallback, useRef, useState } from 'react'
import {
  analyzeScanImageCrop,
  normalizeScanImageCrop,
  type ScanImageCrop,
  type ScanImageCropDiagnostics,
} from '../../../../services/scanImagePreprocessor'

export const EMPTY_CROP: ScanImageCrop = { left: 0, top: 0, right: 0, bottom: 0 }

const FAILED_DIAGNOSTICS: ScanImageCropDiagnostics = {
  blueDetected: false,
  paperDetected: false,
  valid: false,
  reason: 'No se pudo calcular el recorte sugerido',
  bluePixelsInside: 0,
}

/** ¿El recorte recorta algo, o es el vacío (todos los lados en 0)? */
export const hasVisibleCrop = (crop: ScanImageCrop): boolean =>
  Object.values(crop).some((side) => side > 0)

interface UseScanCropOptions {
  /** Se llama cuando el recorte no se pudo detectar y el usuario lo pidió explícitamente. */
  onWarning: (message: string) => void
}

/**
 * El recorte sugerido de la foto del formulario: detección, edición manual y
 * diagnóstico. La detección es asíncrona y el usuario puede disparar varias
 * (cambiar de foto, recalcular), así que cada una lleva un id y solo la última
 * puede escribir el estado: sin eso, una detección lenta de la foto anterior
 * pisaría el recorte de la foto nueva.
 */
export function useScanCrop({ onWarning }: UseScanCropOptions) {
  const [crop, setCrop] = useState<ScanImageCrop>(EMPTY_CROP)
  const [diagnostics, setDiagnostics] = useState<ScanImageCropDiagnostics | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)
  const latestRequestRef = useRef(0)

  /** Invalida cualquier detección en vuelo y vuelve al recorte vacío. */
  const reset = useCallback(() => {
    latestRequestRef.current += 1
    setCrop(EMPTY_CROP)
    setDiagnostics(null)
    setIsEditing(false)
    setIsDetecting(false)
  }, [])

  const detect = useCallback(
    async (file: File, { announceFailure = false } = {}) => {
      const requestId = ++latestRequestRef.current
      setIsDetecting(true)
      try {
        const analysis = await analyzeScanImageCrop(file)
        if (requestId !== latestRequestRef.current) return

        setDiagnostics(analysis.diagnostics)
        if (!analysis.crop) {
          setCrop(EMPTY_CROP)
          setIsEditing(false)
          if (announceFailure) onWarning(analysis.diagnostics.reason)
          return
        }

        setCrop(analysis.crop)
        setIsEditing(true)
      } catch {
        if (requestId !== latestRequestRef.current) return
        setCrop(EMPTY_CROP)
        setDiagnostics(FAILED_DIAGNOSTICS)
        setIsEditing(false)
        if (announceFailure) onWarning(FAILED_DIAGNOSTICS.reason)
      } finally {
        if (requestId === latestRequestRef.current) setIsDetecting(false)
      }
    },
    [onWarning],
  )

  /** Mueve un lado del recorte; el valor llega en porcentaje (0-100). */
  const setSide = useCallback((side: keyof ScanImageCrop, percent: number) => {
    setCrop((previous) => normalizeScanImageCrop({ ...previous, [side]: percent / 100 }))
  }, [])

  /** Recalcula el recorte a pedido del usuario (por eso sí avisa si falla). */
  const redetect = useCallback(
    async (file: File) => {
      if (isDetecting) return
      await detect(file, { announceFailure: true })
    },
    [detect, isDetecting],
  )

  /**
   * Abre o cierra el editor. Si aún no hay recorte que editar, primero intenta
   * detectarlo — abrir un editor vacío no le sirve a nadie.
   */
  const toggleEditor = useCallback(
    async (file: File | null) => {
      if (isEditing) {
        setIsEditing(false)
        return
      }
      if (hasVisibleCrop(crop) || !file || isDetecting) {
        setIsEditing(true)
        return
      }
      await detect(file, { announceFailure: true })
    },
    [crop, detect, isDetecting, isEditing],
  )

  return {
    crop,
    diagnostics,
    isEditing,
    isDetecting,
    /** El recorte a enviar al servidor: `undefined` si no recorta nada. */
    croppedArea: hasVisibleCrop(crop) ? crop : undefined,
    detect,
    redetect,
    reset,
    setSide,
    toggleEditor,
    openEditor: () => setIsEditing(true),
  }
}
