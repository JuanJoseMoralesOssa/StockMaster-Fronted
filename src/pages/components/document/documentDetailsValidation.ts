import type { BaseDocumentDetail } from '@/pages/components/common/DocumentDetailRow'

export type DetailFieldErrors = {
  product?: boolean
  supplier?: boolean
  weight?: boolean
}

export type DetailFieldKey = keyof DetailFieldErrors
export type DetailValidationErrors = Record<string, DetailFieldErrors>

const FIELD_LABELS: Record<DetailFieldKey, string> = {
  product: 'producto',
  supplier: 'proveedor',
  weight: 'kg',
}

export function getDetailValidationKey(detail: { id?: number | string }, index: number) {
  return detail.id !== undefined ? String(detail.id) : `index-${index}`
}

function hasPositiveId(value: unknown) {
  return (typeof value === 'number' || typeof value === 'string') && Number(value) > 0
}

function hasPositiveWeight(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

export function validateDocumentDetails<TDetail extends BaseDocumentDetail>(details: TDetail[]) {
  const errors: DetailValidationErrors = {}

  details.forEach((detail, index) => {
    const rowErrors: DetailFieldErrors = {}
    const productId = detail.product?.id ?? detail.productId
    const supplierId = detail.person?.id ?? detail.personId

    if (!hasPositiveId(productId)) {
      rowErrors.product = true
    }

    if (!hasPositiveId(supplierId)) {
      rowErrors.supplier = true
    }

    if (!hasPositiveWeight(detail.weight_kg)) {
      rowErrors.weight = true
    }

    if (Object.keys(rowErrors).length > 0) {
      errors[getDetailValidationKey(detail, index)] = rowErrors
    }
  })

  return {
    errors,
    message: formatDetailValidationMessage(errors, details),
    isValid: Object.keys(errors).length === 0,
  }
}

export function formatDetailValidationMessage<TDetail extends { id?: number | string }>(
  errors: DetailValidationErrors,
  details: TDetail[],
) {
  const rowMessages = details
    .map((detail, index) => {
      const rowErrors = errors[getDetailValidationKey(detail, index)]
      if (!rowErrors) return ''

      const missingFields = (Object.keys(rowErrors) as DetailFieldKey[])
        .filter((field) => rowErrors[field])
        .map((field) => FIELD_LABELS[field])

      if (missingFields.length === 0) return ''

      return `Fila ${index + 1}: ${missingFields.join(', ')}`
    })
    .filter(Boolean)

  return rowMessages.length > 0 ? `${rowMessages.join('. ')}.` : ''
}
