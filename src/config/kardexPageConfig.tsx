/* eslint-disable react-refresh/only-export-components */
import { GenericPageConfig } from '../types/GenericConfig'
import Kardex from '../types/Kardex'
import { kardexService } from '../services/KardexService'
import { useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { Button } from '../components/ui'
import Autocomplete from '../pages/components/common/Autocomplete'
import { useProductStore } from '../stores'

const operationOptions = [
  { value: 1, label: 'Entrada' },
  { value: 2, label: 'Salida' },
  { value: 3, label: 'Kardex' },
]

const dateToggleClasses = {
  active: 'w-full border border-[var(--view-accent,var(--color-action-bg))] bg-[var(--view-accent,var(--color-action-bg))] text-white shadow-sm hover:bg-[var(--view-accent-hover,var(--color-action-bg-hover))] md:w-fit',
  inactive: 'w-full border border-[var(--view-accent-border,var(--color-border-strong))] bg-(--color-bg-surface) text-[var(--view-accent-text,var(--color-text-link))] hover:bg-[var(--view-accent-soft,var(--color-bg-subtle))] md:w-fit',
}

export interface KardexFilters {
  startDate: string
  endDate: string
  productId: string
  productName: string
  operation: string
  balanceRecord: '' | 'yes' | 'no'
  activeDate: boolean
}

function buildInitialKardexFilters(): KardexFilters {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return {
    startDate: `${year}-${month}-01`,
    endDate: `${year}-${month}-${day}`,
    productId: '',
    productName: '',
    operation: '',
    balanceRecord: '',
    activeDate: false,
  }
}

function KardexFiltersSection({
  filters,
  setFilters,
  onSearch,
  onClear,
  loading,
}: Readonly<{
  filters: KardexFilters
  setFilters: (filters: KardexFilters) => void
  onSearch: () => void
  onClear: () => void
  loading: boolean
}>) {
  const products = useProductStore((state) => state.products)
  const fetchProducts = useProductStore((state) => state.fetchProducts)

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const productOptions = products
    .filter(product => product.id !== undefined && product.name !== undefined)
    .map(product => ({
      id: product.id!,
      label: product.name,
      name: product.name,
    }))
  const selectedProduct = productOptions.find(option => option.id.toString() === filters.productId)
  const selectedProductName = selectedProduct?.label || filters.productName

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        onSearch()
      }}
    >
      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr]">
        <Autocomplete
          key={`kardex-product-${filters.productId || 'empty'}`}
          options={productOptions}
          label="Producto"
          placeholder="Buscar producto..."
          displayKey="label"
          initialValue={selectedProductName}
          onSelect={(option) => setFilters({
            ...filters,
            productId: option ? option.id.toString() : '',
            productName: option && typeof option.label === 'string' ? option.label : '',
          })}
          clearable
          noOptionsText="No se encontraron productos"
          labelClassName="block text-sm font-medium text-(--color-text-secondary) mb-1"
          inputClassName="w-full h-input rounded-md border border-(--color-border) bg-(--color-bg-surface) px-3 pr-8 text-sm text-(--color-text-primary) transition-colors focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus-ring)"
        />

        <div className="flex flex-col">
          <label htmlFor="kardex-operation-filter" className="mb-1 text-sm font-medium text-(--color-text-secondary)">
            Operacion
          </label>
          <select
            id="kardex-operation-filter"
            value={filters.operation}
            onChange={(event) => setFilters({ ...filters, operation: event.target.value })}
            className="h-input rounded-md border border-(--color-border) bg-(--color-bg-surface) px-3 text-sm text-(--color-text-primary) focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus-ring)"
          >
            <option value="">Todas</option>
            {operationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label htmlFor="kardex-balance-record-filter" className="mb-1 text-sm font-medium text-(--color-text-secondary)">
            Ultimo registro
          </label>
          <select
            id="kardex-balance-record-filter"
            value={filters.balanceRecord}
            onChange={(event) => setFilters({ ...filters, balanceRecord: event.target.value as KardexFilters['balanceRecord'] })}
            className="h-input rounded-md border border-(--color-border) bg-(--color-bg-surface) px-3 text-sm text-(--color-text-primary) focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus-ring)"
          >
            <option value="">Todos</option>
            <option value="yes">Solo ultimo registro</option>
            <option value="no">No ultimo registro</option>
          </select>
        </div>
      </div>

      <div className="rounded-md bg-[var(--view-accent-soft,var(--color-bg-subtle))] p-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <Button
            type="button"
            variant={filters.activeDate ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilters({ ...filters, activeDate: !filters.activeDate })}
            className={filters.activeDate ? dateToggleClasses.active : dateToggleClasses.inactive}
            disabled={loading}
          >
            {filters.activeDate ? 'Rango activo' : 'Filtrar por fechas'}
          </Button>

          {filters.activeDate && (
            <div className="grid flex-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col">
                <label htmlFor="kardex-start-date" className="mb-1 text-sm font-medium text-(--color-text-secondary)">
                  Fecha inicio
                </label>
                <input
                  id="kardex-start-date"
                  type="date"
                  value={filters.startDate}
                  onChange={(event) => setFilters({ ...filters, startDate: event.target.value })}
                  className="h-input rounded-md border border-(--color-border) bg-(--color-bg-surface) px-3 text-sm text-(--color-text-primary) focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus-ring)"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="kardex-end-date" className="mb-1 text-sm font-medium text-(--color-text-secondary)">
                  Fecha fin
                </label>
                <input
                  id="kardex-end-date"
                  type="date"
                  value={filters.endDate}
                  onChange={(event) => setFilters({ ...filters, endDate: event.target.value })}
                  className="h-input rounded-md border border-(--color-border) bg-(--color-bg-surface) px-3 text-sm text-(--color-text-primary) focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus-ring)"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
        <Button type="submit" size="sm" className="w-full sm:w-fit" loading={loading} leftIcon={<Search className="h-4 w-4" />}>
          Buscar
        </Button>
        <Button type="button" variant="secondary" size="sm" className="w-full sm:w-fit" disabled={loading} leftIcon={<X className="h-4 w-4" />} onClick={onClear}>
          Limpiar
        </Button>
      </div>
    </form>
  )
}

export const kardexPageConfig: GenericPageConfig<Kardex, KardexFilters> = {
  entityName: 'Registro de Kardex',
  entityNamePlural: 'Kardex',
  idField: 'id',
  rowClassName: (entry) => (entry.balance_record ? 'bg-success-50/70' : ''),
  initialFilterState: buildInitialKardexFilters(),
  clearFilterState: buildInitialKardexFilters(),

  columns: [
    {
      key: 'date',
      label: 'Fecha',
      render: (entry) => (
        <span className='font-medium text-(--color-text-primary)'>
          {new Date(entry.date).toLocaleDateString('es-ES')}
        </span>
      ),
    },
    {
      key: 'product',
      label: 'Nombre del producto',
      render: (entry) => (
        <span className='inline-flex items-center rounded-md border border-[var(--view-accent-border,var(--color-border-strong))] bg-(--color-bg-surface) px-2.5 py-1 text-xs font-semibold text-(--color-text-primary) shadow-xs'>
          {entry.product?.name ?? `Producto #${entry.productId}`}
        </span>
      ),
    },
    {
      key: 'input',
      label: 'Entrada',
      render: (entry) => (
        <span className='font-semibold text-emerald-700'>+{entry.input}</span>
      ),
    },
    {
      key: 'output',
      label: 'Salida',
      render: (entry) => (
        <span className='font-semibold text-rose-700'>-{entry.output}</span>
      ),
    },
    {
      key: 'balance',
      label: 'Saldo',
      render: (entry) => (
        <span className='inline-flex items-center rounded-md border border-[var(--view-accent-border,var(--color-border-strong))] bg-(--color-bg-surface) px-2 py-1 text-xs font-semibold text-[var(--view-accent-text,var(--color-text-link))] shadow-xs'>
          {entry.balance}
        </span>
      ),
    },
    {
      key: 'balance_record',
      label: 'Ultimo Registro',
      render: (entry) => (
        <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold shadow-xs ${entry.balance_record ? 'border border-success-500/50 bg-success-50 text-success-700' : 'border border-(--color-border-strong) bg-(--color-bg-surface) text-(--color-text-primary)'}`}>
          {entry.balance_record ? 'Si' : 'No'}
        </span>
      ),
    },
    {
      key: 'operation',
      label: 'Operacion',
      render: (entry) => {
        const label = operationOptions.find((op) => op.value === entry.operation)?.label ?? 'N/A'
        const tone = entry.operation === 1
          ? 'border border-emerald-600/40 bg-emerald-50 text-emerald-800'
          : entry.operation === 2
            ? 'border border-rose-600/40 bg-rose-50 text-rose-800'
            : 'border border-amber-600/40 bg-amber-50 text-amber-800'
        return (
          <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold shadow-xs ${tone}`}>
            {label}
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
      options: operationOptions,
      defaultValue: 3,
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
    {
      name: 'balance_record',
      label: 'Ultimo Registro',
      type: 'checkbox',
      defaultValue: true,
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
    const preparedData = { ...data }

    if (preparedData.date) {
      preparedData.date = new Date(preparedData.date).toISOString()
    }

    if (preparedData.input !== undefined && preparedData.input !== null) {
      preparedData.input = Number(preparedData.input)
    }

    if (preparedData.output !== undefined && preparedData.output !== null) {
      preparedData.output = Number(preparedData.output)
    }

    if (preparedData.balance !== undefined && preparedData.balance !== null) {
      preparedData.balance = Number(preparedData.balance)
    }

    if (preparedData.productId !== undefined && preparedData.productId !== null) {
      preparedData.productId = Number(preparedData.productId)
    }

    if (preparedData.operation !== undefined && preparedData.operation !== null) {
      preparedData.operation = Number(preparedData.operation)
    }

    if (!isEdit) {
      if (preparedData.operation === undefined) preparedData.operation = 3
      if (preparedData.balance_record === undefined) preparedData.balance_record = true
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
