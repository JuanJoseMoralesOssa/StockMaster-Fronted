import type { ScanImageOptimizationMetadata } from '../../../../services/scanImagePreprocessor'

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface ScanOptimizationDebugProps {
  metadata: ScanImageOptimizationMetadata | null
  /** Vista previa de la imagen ya recortada y comprimida que viajó al servidor. */
  previewUrl: string | null
}

/**
 * Qué imagen se envió realmente al backend. Cuando la lectura sale mal, lo
 * primero que hay que descartar es que el recorte o la compresión se hayan
 * comido el formulario; sin este panel eso solo se ve abriendo el DevTools.
 */
export function ScanOptimizationDebug({ metadata, previewUrl }: Readonly<ScanOptimizationDebugProps>) {
  if (!metadata) return null

  return (
    <details className="rounded-lg border border-(--color-border) bg-(--color-bg-subtle) p-3 text-xs text-(--color-text-secondary)">
      <summary className="cursor-pointer select-none font-medium text-(--color-text-primary)">
        Imagen enviada al servidor
      </summary>
      <div className="mt-2 grid gap-1 sm:grid-cols-2">
        <span>
          Original: {metadata.original.width}x{metadata.original.height} ·{' '}
          {formatBytes(metadata.original.sizeBytes)}
        </span>
        <span>
          Enviada: {metadata.output.width}x{metadata.output.height} ·{' '}
          {formatBytes(metadata.output.sizeBytes)} · {metadata.output.type}
        </span>
        <span>
          Crop px: x {metadata.cropRect.x}, y {metadata.cropRect.y}
        </span>
        <span>
          Area crop: {metadata.cropRect.width}x{metadata.cropRect.height} · calidad{' '}
          {Math.round(metadata.output.quality * 100)}%
        </span>
      </div>
      {previewUrl && (
        <img
          src={previewUrl}
          alt="Imagen enviada al backend"
          className="mt-3 max-h-64 w-full rounded-md border border-(--color-border) bg-(--color-bg-surface) object-contain"
        />
      )}
    </details>
  )
}

export default ScanOptimizationDebug
