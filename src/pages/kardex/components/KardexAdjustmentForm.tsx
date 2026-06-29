import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Label, Textarea } from '@/components/ui'
import Autocomplete from '@/pages/components/common/Autocomplete'
import { useProductStore } from '@/stores'
import { useApiRequest } from '@/hooks/useApiRequest'
import { productService, BalanceAdjustmentInput } from '@/services/ProductService'
import { formatKg } from '@/utils/format'
import type Kardex from '@/types/Kardex'

interface KardexAdjustmentFormProps {
  /** Cierra el modal de creación. */
  onSuccess: () => void
  /** Inserta el movimiento de kardex recién creado en la lista. */
  onItemCreated: (kardex: Kardex) => void
}

type AdjustmentMode = 'set' | 'delta'

const round3 = (n: number) => Math.round(n * 1000) / 1000

const modeToggle = {
  active:
    'border border-(--view-accent,var(--color-action-bg)) bg-(--view-accent,var(--color-action-bg)) text-(--color-action-text) shadow-sm hover:bg-(--view-accent-hover,var(--color-action-bg-hover))',
  inactive:
    'border border-(--view-accent-border,var(--color-border-strong)) bg-(--color-bg-surface) text-(--view-accent-text,var(--color-text-link)) hover:bg-(--view-accent-soft,var(--color-bg-subtle))',
}

const numberInputClasses =
  'block h-input w-full rounded-md border border-(--color-border) bg-(--color-bg-surface) px-3 text-sm pointer-coarse:text-[1rem] text-(--color-text-primary) transition-colors hover:border-(--color-border-strong) focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus-ring)'

/**
 * Ajuste manual de inventario ("cuadrar" balance). El usuario elige un producto y
 * o bien fija el balance real contado (`set`) o aplica un +/- (`delta`); el backend
 * actualiza Product.balance y escribe la fila de kardex (operación "Ajuste manual")
 * de forma atómica. El motivo es obligatorio para dejar rastro auditable.
 */
export default function KardexAdjustmentForm({
  onSuccess,
  onItemCreated,
}: Readonly<KardexAdjustmentFormProps>) {
  const products = useProductStore((state) => state.products)
  const fetchProducts = useProductStore((state) => state.fetchProducts)
  const refreshProducts = useProductStore((state) => state.refreshProducts)

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const [productId, setProductId] = useState<number | null>(null)
  const [mode, setMode] = useState<AdjustmentMode>('set')
  const [value, setValue] = useState('')
  const [note, setNote] = useState('')
  const [formError, setFormError] = useState('')

  const productOptions = useMemo(
    () =>
      products
        .filter((product) => product.id !== undefined && product.name !== undefined)
        .map((product) => ({ id: product.id!, label: product.name!, name: product.name! })),
    [products],
  )

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === productId),
    [products, productId],
  )
  const currentBalance = round3(selectedProduct?.balance ?? 0)

  const numericValue = Number(value)
  const hasValue = value.trim() !== '' && Number.isFinite(numericValue)
  const resultingBalance = hasValue
    ? round3(mode === 'set' ? numericValue : currentBalance + numericValue)
    : null

  const { loading, execute } = useApiRequest(
    (id: number, input: BalanceAdjustmentInput) => productService.adjustBalance(id, input),
    {
      successMessage: 'Ajuste de inventario registrado',
      errorMessage: 'No se pudo registrar el ajuste',
      showSuccessToast: true,
      throwOnError: true,
      onSuccess: (kardex: Kardex) => {
        onItemCreated(kardex)
        // El balance cambió: invalida el caché para que las demás vistas lo reflejen.
        refreshProducts()
        onSuccess()
      },
    },
  )

  const validate = (): string | null => {
    if (productId == null) return 'Selecciona un producto'
    if (!hasValue) return 'Ingresa un valor numérico'
    if (mode === 'set' && numericValue < 0) return 'El balance real no puede ser negativo'
    if (resultingBalance == null || resultingBalance < 0) {
      return 'El ajuste dejaría el balance en un valor negativo'
    }
    if (resultingBalance === currentBalance) return 'El ajuste no cambia el balance actual'
    if (!note.trim()) return 'El motivo del ajuste es obligatorio'
    return null
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (loading) return

    const validationError = validate()
    if (validationError) {
      setFormError(validationError)
      return
    }
    setFormError('')

    try {
      await execute(productId!, { mode, value: numericValue, note: note.trim() })
    } catch {
      // El toast de error ya lo muestra useApiRequest.
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 py-2" noValidate>
      <div className="space-y-1">
        <Autocomplete
          options={productOptions}
          label="Producto"
          required
          placeholder="Buscar producto..."
          displayKey="label"
          onSelect={(option) => {
            setProductId(option ? Number(option.id) : null)
            setFormError('')
          }}
          clearable
          autoSelectExactMatchOnBlur
          noOptionsText="No se encontraron productos"
        />
        {selectedProduct && (
          <p className="text-sm text-(--color-text-secondary)">
            Balance actual: <span className="font-semibold text-(--color-text-primary)">{formatKg(currentBalance)}</span>
          </p>
        )}
      </div>

      <fieldset className="space-y-2">
        <legend className="mb-1 block text-sm font-medium text-(--color-text-secondary)">
          Tipo de ajuste
        </legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button
            type="button"
            variant={mode === 'set' ? 'primary' : 'outline'}
            size="sm"
            className={mode === 'set' ? modeToggle.active : modeToggle.inactive}
            onClick={() => setMode('set')}
          >
            Conteo real (fijar a)
          </Button>
          <Button
            type="button"
            variant={mode === 'delta' ? 'primary' : 'outline'}
            size="sm"
            className={mode === 'delta' ? modeToggle.active : modeToggle.inactive}
            onClick={() => setMode('delta')}
          >
            Cantidad (+/-)
          </Button>
        </div>
      </fieldset>

      <div className="space-y-1">
        <Label htmlFor="adjustment-value" required>
          {mode === 'set' ? 'Balance real contado' : 'Cantidad a sumar/restar'}
        </Label>
        <input
          id="adjustment-value"
          type="number"
          inputMode="decimal"
          step="0.001"
          className={numberInputClasses}
          value={value}
          placeholder={mode === 'set' ? 'Ej: 42' : 'Ej: -3 o 5'}
          onChange={(event) => {
            setValue(event.target.value)
            setFormError('')
          }}
        />
        {resultingBalance != null && productId != null && (
          <p className="text-sm text-(--color-text-secondary)">
            Balance resultante:{' '}
            <span className="font-semibold text-(--view-accent-text,var(--color-text-link))">
              {formatKg(resultingBalance)}
            </span>
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="adjustment-note" required>
          Motivo
        </Label>
        <Textarea
          id="adjustment-note"
          value={note}
          placeholder="Ej: conteo físico, merma, corrección de error"
          rows={3}
          onChange={(event) => {
            setNote(event.target.value)
            setFormError('')
          }}
        />
      </div>

      {formError && (
        <Alert variant="warning" title="Revisa el ajuste">
          {formError}
        </Alert>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onSuccess} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={loading}>
          Registrar ajuste
        </Button>
      </div>
    </form>
  )
}
