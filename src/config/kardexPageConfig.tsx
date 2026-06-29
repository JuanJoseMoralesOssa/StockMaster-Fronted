import { GenericPageConfig } from '../types/GenericConfig'
import Kardex from '../types/Kardex'
import { kardexService } from '../services/KardexService'
import { formatLocalDate } from '../utils/date'
import { formatKg } from '../utils/format'
import KardexFiltersSection from '../pages/kardex/components/KardexFiltersSection'
import KardexAdjustmentForm from '../pages/kardex/components/KardexAdjustmentForm'
import { KARDEX_OPERATION_OPTIONS, KARDEX_OPERATION_MANUAL, KardexFilters, buildInitialKardexFilters } from '../pages/kardex/kardexFilters'

// Re-export para los consumidores existentes del config (p. ej. Kardex.tsx).
export type { KardexFilters }
export { buildInitialKardexFilters }

export const kardexPageConfig: GenericPageConfig<Kardex, KardexFilters> = {
  entityName: 'Registro de Kardex',
  entityNamePlural: 'Kardex',
  idField: 'id',
  rowClassName: (entry) => (entry.input > 0 ? 'bg-success-50/70' : entry.output > 0 ? 'bg-danger-50/60' : ''),
  initialFilterState: buildInitialKardexFilters(),
  clearFilterState: buildInitialKardexFilters(),

  columns: [
    {
      key: 'date',
      label: 'Fecha',
      render: (entry) => (
        <span className='font-medium text-(--color-text-primary)'>
          {formatLocalDate(entry.date)}
        </span>
      ),
    },
    {
      key: 'product',
      label: 'Nombre del producto',
      render: (entry) => (
        <span className='inline-flex items-center rounded-md border border-(--view-accent-border,var(--color-border-strong)) bg-(--color-bg-surface) px-2.5 py-1 text-xs font-semibold text-(--color-text-primary) shadow-xs'>
          {entry.product?.name ?? `Producto #${entry.productId}`}
        </span>
      ),
    },
    {
      key: 'supplier',
      label: 'Proveedor',
      render: (entry) =>
        entry.supplierName ? (
          <span className='text-(--color-text-primary)'>{entry.supplierName}</span>
        ) : (
          <span className='text-(--color-text-muted)'>—</span>
        ),
    },
    {
      key: 'input',
      label: 'Entrada',
      align: 'right',
      render: (entry) => (
        <span className='font-semibold text-success-700'>+{formatKg(entry.input)}</span>
      ),
    },
    {
      key: 'output',
      label: 'Salida',
      align: 'right',
      render: (entry) => (
        <span className='font-semibold text-danger-700'>-{formatKg(entry.output)}</span>
      ),
    },
    {
      key: 'balance',
      label: 'Balance',
      align: 'right',
      render: (entry) => (
        <span className='inline-flex items-center rounded-md border border-(--view-accent-border,var(--color-border-strong)) bg-(--color-bg-surface) px-2 py-1 text-xs font-semibold text-(--view-accent-text,var(--color-text-link)) shadow-xs'>
          {formatKg(entry.balance)}
        </span>
      ),
    },
    {
      key: 'operation',
      label: 'Operacion',
      render: (entry) => {
        const label = KARDEX_OPERATION_OPTIONS.find((op) => op.value === entry.operation)?.label ?? 'N/A'
        // El ajuste manual se distingue con tono de marca; el resto sigue la
        // dirección del movimiento (entrada = verde, salida = rojo).
        const tone = entry.operation === KARDEX_OPERATION_MANUAL
          ? 'border border-(--view-accent-border,var(--color-border-strong)) bg-(--view-accent-soft,var(--color-bg-subtle)) text-(--view-accent-text,var(--color-text-link))'
          : entry.input > 0
            ? 'border border-success-200 bg-success-50 text-success-700'
            : entry.output > 0
              ? 'border border-danger-200 bg-danger-50 text-danger-700'
              : 'border border-warning-200 bg-warning-50 text-warning-700'
        return (
          <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold shadow-xs ${tone}`}>
            {label}
          </span>
        )
      },
    },
    {
      key: 'sourceKind',
      label: 'Origen',
      render: (entry) => {
        const sourceLabel = entry.sourceKind === 'purchase'
          ? 'Compra'
          : entry.sourceKind === 'payment'
            ? 'Pago'
            : entry.operation === KARDEX_OPERATION_MANUAL
              ? 'Ajuste manual'
              : 'Sin origen'
        const sourceParts = [
          entry.sourceId ? `#${entry.sourceId}` : '',
          entry.sourceDetailId ? `Detalle #${entry.sourceDetailId}` : '',
        ].filter(Boolean)

        return (
          <span className='inline-flex flex-col rounded-md border border-(--color-border-strong) bg-(--color-bg-surface) px-2.5 py-1 text-xs font-semibold text-(--color-text-primary) shadow-xs'>
            <span>{sourceLabel}</span>
            {sourceParts.length > 0 && (
              <span className='font-normal text-(--color-text-muted)'>{sourceParts.join(' - ')}</span>
            )}
            {entry.note && (
              <span className='font-normal text-(--color-text-muted)'>{entry.note}</span>
            )}
          </span>
        )
      },
    },
  ],

  // El kardex es de solo lectura (append-only generado por el sistema). La única
  // mutación permitida es el "Ajuste de inventario", que crea el movimiento vía
  // POST /products/{id}/adjustment (ver KardexAdjustmentForm). Por eso no hay
  // campos de formulario genérico ni edición/eliminación.
  formFields: [],

  actions: {
    canEdit: false,
    canDelete: false,
  },

  createButtonText: 'Ajustar inventario',
  createModalTitle: 'Ajuste de inventario',
  createModalDescription: 'Corrige el balance de un producto (conteo físico, merma, etc.). Queda registrado como un movimiento de kardex.',
  renderCustomForm: (onSuccess, onItemCreated) => (
    <KardexAdjustmentForm onSuccess={onSuccess} onItemCreated={onItemCreated} />
  ),

  renderCustomFilters: ({ filters, setFilters, onSearch, onClear, loading }) => (
    <KardexFiltersSection
      filters={filters}
      setFilters={setFilters}
      onSearch={onSearch}
      onClear={onClear}
      loading={loading}
    />
  ),

  service: kardexService,
}
