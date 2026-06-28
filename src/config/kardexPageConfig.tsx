import { GenericPageConfig } from '../types/GenericConfig'
import Kardex from '../types/Kardex'
import { kardexService } from '../services/KardexService'
import { coerceNumericFields } from '../utils/form'
import { formatLocalDate, toCalendarDate } from '../utils/date'
import KardexFiltersSection from '../pages/kardex/components/KardexFiltersSection'
import { KARDEX_OPERATION_OPTIONS, KardexFilters, buildInitialKardexFilters } from '../pages/kardex/kardexFilters'

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
      key: 'input',
      label: 'Entrada',
      align: 'right',
      render: (entry) => (
        <span className='font-semibold text-success-700'>+{entry.input}</span>
      ),
    },
    {
      key: 'output',
      label: 'Salida',
      align: 'right',
      render: (entry) => (
        <span className='font-semibold text-danger-700'>-{entry.output}</span>
      ),
    },
    {
      key: 'balance',
      label: 'Saldo',
      align: 'right',
      render: (entry) => (
        <span className='inline-flex items-center rounded-md border border-(--view-accent-border,var(--color-border-strong)) bg-(--color-bg-surface) px-2 py-1 text-xs font-semibold text-(--view-accent-text,var(--color-text-link)) shadow-xs'>
          {entry.balance}
        </span>
      ),
    },
    {
      key: 'operation',
      label: 'Operacion',
      render: (entry) => {
        const label = KARDEX_OPERATION_OPTIONS.find((op) => op.value === entry.operation)?.label ?? 'N/A'
        const tone = entry.operation === 1 || entry.operation === 4
          ? 'border border-success-200 bg-success-50 text-success-700'
          : entry.operation === 3
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
          : entry.sourceKind === 'expense'
            ? 'Gasto'
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
          </span>
        )
      },
    },
  ],

  formFields: [
    {
      name: 'date',
      label: 'Fecha',
      type: 'date',
      required: true,
    },
    {
      name: 'productId',
      label: 'ID de Producto',
      type: 'number',
      required: true,
      min: 1,
    },
    {
      name: 'operation',
      label: 'Operacion',
      type: 'select',
      required: true,
      options: KARDEX_OPERATION_OPTIONS,
      defaultValue: 1,
    },
    {
      name: 'input',
      label: 'Entrada',
      type: 'number',
      required: true,
      min: 0,
      defaultValue: 0,
    },
    {
      name: 'output',
      label: 'Salida',
      type: 'number',
      required: true,
      min: 0,
      defaultValue: 0,
    },
    {
      name: 'balance',
      label: 'Saldo',
      type: 'number',
      required: true,
      defaultValue: 0,
    },
  ],

  actions: {
    canEdit: true,
    canDelete: true,
  },

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

  prepareDataForSubmit: async (data: Partial<Kardex>, isEdit: boolean) => {
    const preparedData = coerceNumericFields(
      { ...data },
      ['input', 'output', 'balance', 'productId', 'operation'],
    )

    if (preparedData.date) {
      preparedData.date = toCalendarDate(preparedData.date)
    }

    if (!isEdit) {
      if (preparedData.operation === undefined) preparedData.operation = 1
    }

    return preparedData
  },

  validateData: async (data: Partial<Kardex>) => {
    if (data.productId !== undefined && data.productId <= 0) {
      return 'Debe indicar un ID de producto valido'
    }

    if (data.input !== undefined && data.input < 0) {
      return 'La entrada no puede ser negativa'
    }

    if (data.output !== undefined && data.output < 0) {
      return 'La salida no puede ser negativa'
    }

    if (data.balance !== undefined && Number.isNaN(Number(data.balance))) {
      return 'El saldo debe ser numerico'
    }

    return undefined
  },

  createSuccessMessage: 'Registro de kardex creado exitosamente',
  updateSuccessMessage: 'Registro de kardex actualizado exitosamente',
  deleteSuccessMessage: 'Registro de kardex eliminado exitosamente',
}
