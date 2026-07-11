import { Crop, RotateCcw, ScanLine } from 'lucide-react'
import { Button, Input } from '../../../../components/ui'
import type {
  ScanImageCrop,
  ScanImageCropDiagnostics,
} from '../../../../services/scanImagePreprocessor'
import { hasVisibleCrop } from '../hooks/useScanCrop'

/** El recorte se guarda como fracción (0-1) y se muestra como porcentaje. */
const toPercent = (fraction: number): number => Math.round(fraction * 100)

const SIDES: ReadonlyArray<readonly [keyof ScanImageCrop, string]> = [
  ['top', 'Arriba'],
  ['bottom', 'Abajo'],
  ['left', 'Izquierda'],
  ['right', 'Derecha'],
]

interface ScanCropEditorProps {
  previewUrl: string
  crop: ScanImageCrop
  diagnostics: ScanImageCropDiagnostics | null
  isEditing: boolean
  isDetecting: boolean
  onToggleEditor: () => void
  onRedetect: () => void
  onReset: () => void
  onSideChange: (side: keyof ScanImageCrop, percent: number) => void
}

/** Zona oscurecida: lo que quedará FUERA del recorte. */
function CropOverlay({ crop }: Readonly<{ crop: ScanImageCrop }>) {
  const inset = {
    top: `${toPercent(crop.top)}%`,
    bottom: `${toPercent(crop.bottom)}%`,
    left: `${toPercent(crop.left)}%`,
    right: `${toPercent(crop.right)}%`,
  }

  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-0 right-0 top-0 bg-black/45" style={{ height: inset.top }} />
      <div className="absolute bottom-0 left-0 right-0 bg-black/45" style={{ height: inset.bottom }} />
      <div
        className="absolute bg-black/45"
        style={{ bottom: inset.bottom, left: 0, top: inset.top, width: inset.left }}
      />
      <div
        className="absolute bg-black/45"
        style={{ bottom: inset.bottom, right: 0, top: inset.top, width: inset.right }}
      />
      <div
        className="absolute border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.45)]"
        style={{ bottom: inset.bottom, left: inset.left, right: inset.right, top: inset.top }}
      />
    </div>
  )
}

/**
 * Vista previa de la foto con el recorte sugerido encima, sus cuatro deslizadores
 * y el diagnóstico de por qué se detectó (o no) el formulario.
 */
export function ScanCropEditor({
  previewUrl,
  crop,
  diagnostics,
  isEditing,
  isDetecting,
  onToggleEditor,
  onRedetect,
  onReset,
  onSideChange,
}: Readonly<ScanCropEditorProps>) {
  const isCropped = hasVisibleCrop(crop)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-center rounded-lg border border-(--color-border) bg-(--color-bg-surface)">
        <div className="relative overflow-hidden">
          <img
            src={previewUrl}
            alt="Vista previa del formulario"
            className="block max-h-96 max-w-full object-contain"
          />
          {isEditing && <CropOverlay crop={crop} />}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={isEditing ? 'secondary' : 'outline'}
          leftIcon={<Crop className="h-4 w-4" />}
          loading={!isEditing && isDetecting}
          onClick={onToggleEditor}
        >
          Recortar foto
        </Button>
        <Button
          variant="outline"
          leftIcon={<ScanLine className="h-4 w-4" />}
          loading={isDetecting}
          onClick={onRedetect}
        >
          Recalcular recorte
        </Button>
        {isCropped && (
          <Button variant="ghost" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={onReset}>
            Quitar recorte
          </Button>
        )}
      </div>

      {isEditing && (
        <div className="grid gap-3 rounded-lg border border-(--color-border) bg-(--color-bg-subtle) p-3 sm:grid-cols-2">
          {SIDES.map(([side, label]) => (
            <label
              key={side}
              className="flex flex-col gap-1 text-xs font-medium text-(--color-text-secondary)"
            >
              <span className="flex items-center justify-between">
                {label}
                <span>{toPercent(crop[side])}%</span>
              </span>
              <Input
                type="range"
                min={0}
                max={80}
                step={1}
                value={toPercent(crop[side])}
                onChange={(event) => onSideChange(side, Number(event.target.value))}
                className="h-8 px-0"
              />
            </label>
          ))}
        </div>
      )}

      {diagnostics && (
        <details className="rounded-lg border border-(--color-border) bg-(--color-bg-subtle) p-3 text-xs text-(--color-text-secondary)">
          <summary className="cursor-pointer select-none font-medium text-(--color-text-primary)">
            Diagnóstico del recorte
          </summary>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>Estado: {diagnostics.valid ? 'detectado' : 'sin detectar'}</span>
            <span>Papel: {diagnostics.paperDetected ? 'si' : 'no'}</span>
            <span>Azul: {diagnostics.blueDetected ? 'si' : 'no'}</span>
            <span>Pixeles azules: {diagnostics.bluePixelsInside}</span>
          </div>
          <p className="mt-1">{diagnostics.reason}</p>
          {isCropped && (
            <p className="mt-1">
              Arriba {toPercent(crop.top)}% · Abajo {toPercent(crop.bottom)}% · Izquierda{' '}
              {toPercent(crop.left)}% · Derecha {toPercent(crop.right)}%
            </p>
          )}
        </details>
      )}
    </div>
  )
}

export default ScanCropEditor
