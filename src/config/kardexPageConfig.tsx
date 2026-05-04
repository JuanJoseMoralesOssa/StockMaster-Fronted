import { GenericPageConfig } from '../types/GenericConfig'
import Kardex from '../types/Kardex'
import { kardexService } from '../services/KardexService'

const operationOptions = [
  { value: 1, label: 'Entrada' },
  { value: 2, label: 'Salida' },
  { value: 3, label: 'Kardex' },
]

export const kardexPageConfig: GenericPageConfig<Kardex> = {
  entityName: 'Registro de Kardex',
  entityNamePlural: 'Kardex',
  idField: 'id',
  rowClassName: (entry) => (entry.balance_record ? 'bg-green-50/70' : ''),

  columns: [
    {
      key: 'date',
      label: 'Fecha',
      render: (entry) => (
        <span className='font-medium text-gray-800'>
          {new Date(entry.date).toLocaleDateString('es-ES')}
        </span>
      ),
    },
    {
      key: 'product',
      label: 'Producto',
      render: (entry) => (
        <span className='inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700'>
          {entry.product?.name ?? `#${entry.productId}`}
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
        <span className='inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700'>
          {entry.balance}
        </span>
      ),
    },
    {
      key: 'balance_record',
      label: 'Ultimo Registro',
      render: (entry) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${entry.balance_record ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
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
          ? 'bg-emerald-100 text-emerald-700'
          : entry.operation === 2
            ? 'bg-rose-100 text-rose-700'
            : 'bg-amber-100 text-amber-700'
        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>
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
