import { useState } from 'react'
import { useToast } from '@/hooks/useToast'
import { extractErrorInfo } from '@/utils/error'
import { Alert, FieldGroup, Input, Button } from '@/components/ui'
import { toCalendarDate, toDateInputValue } from '@/utils/date'
import DocumentDetailsTable from '@/pages/components/common/DocumentDetailsTable'
import type { DocumentDetailLike, DocumentLike } from '@/types/DocumentBase'
import {
  DetailFieldKey,
  DetailValidationErrors,
  formatDetailValidationMessage,
  getDetailValidationKey,
  validateDocumentDetails,
} from './documentDetailsValidation'

export interface DocumentEditMessages {
  missingId: string
  missingDate: string
  success: string
  deleted: string
  error: string
}

interface DocumentEditFormProps<TDoc, K extends string> {
  initialDocument: TDoc
  service: {
    updateWithDetails: (doc: TDoc) => Promise<TDoc>
    delete: (id: number | string, item?: TDoc) => Promise<void>
  }
  detailsKey: K
  detailsTitle: string
  messages: DocumentEditMessages
  onSuccess: () => void
  onItemUpdated: (item: TDoc) => void
  onItemDeleted: (id: number | string) => void
}

/**
 * Formulario genérico de edición para documentos con detalles (compras/pagos):
 * fecha + tabla de detalles + guardar vía `updateWithDetails` (optimistic locking).
 */
export default function DocumentEditForm<
  K extends string,
  TDetail extends DocumentDetailLike,
  TDoc extends DocumentLike<K, TDetail>,
>({
  initialDocument,
  service,
  detailsKey,
  detailsTitle,
  messages,
  onSuccess,
  onItemUpdated,
  onItemDeleted,
}: Readonly<DocumentEditFormProps<TDoc, K>>) {
  const [isSaving, setIsSaving] = useState(false)
  // Borrador local: snapshot del documento al abrir el modal de edición.
  const [draft, setDraft] = useState<TDoc>(initialDocument)
  const [validationErrors, setValidationErrors] = useState<DetailValidationErrors>({})
  const [validationMessage, setValidationMessage] = useState('')
  const [hasValidatedDetails, setHasValidatedDetails] = useState(false)
  const { showSuccess, showError } = useToast()

  const details = (draft[detailsKey] ?? []) as TDetail[]

  const handleEdit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSaving(true)

    try {
      if (!draft.id) {
        showError(messages.missingId, 'Error')
        return
      }

      if (!draft.date) {
        showError(messages.missingDate, 'Error')
        return
      }

      const documentId = draft.id
      const payload: TDoc = { ...draft }
      payload.date = toCalendarDate(payload.date)

      const visibleDetails = ((payload[detailsKey] ?? []) as TDetail[]).filter((detail) => !detail.toDelete)
      if (visibleDetails.length === 0) {
        await service.delete(documentId, payload)
        onItemDeleted(documentId)
        showSuccess(messages.deleted, 'Eliminación exitosa')
        onSuccess()
        return
      }

      const validation = validateDocumentDetails(visibleDetails)
      setHasValidatedDetails(true)
      if (!validation.isValid) {
        setValidationErrors(validation.errors)
        setValidationMessage(validation.message)
        return
      }

      setValidationErrors({})
      setValidationMessage('')

      const updated = await service.updateWithDetails(payload)
      onItemUpdated(updated)
      showSuccess(messages.success, 'Actualización exitosa')
      onSuccess()
    } catch (error: unknown) {
      const { message: msg } = extractErrorInfo(error)
      showError(msg || messages.error, 'Error')
      console.error(`Error updating ${detailsKey}:`, error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDetailsChange = (newDetails: TDetail[]) => {
    // Solo los detalles nuevos suman al total; los existentes ya están contados.
    const total_kg = newDetails.reduce(
      (acc, detail) => (detail.toCreate ? acc + (detail.weight_kg ?? 0) : acc),
      0,
    )

    const next = { ...draft, total_kg } as TDoc
    ;(next as Partial<Record<K, TDetail[]>>)[detailsKey] = newDetails
    setDraft(next)
    const visibleDetails = newDetails.filter((detail) => !detail.toDelete)
    if (visibleDetails.length === 0) {
      setValidationErrors({})
      setValidationMessage('')
      setHasValidatedDetails(false)
      return
    }

    if (hasValidatedDetails) {
      const validation = validateDocumentDetails(visibleDetails)
      setValidationErrors(validation.errors)
      setValidationMessage(validation.message)
    }
  }

  const handleDetailValidationChange = (detail: TDetail, index: number, field: DetailFieldKey, hasError: boolean) => {
    if (!hasValidatedDetails) return

    setValidationErrors((currentErrors) => {
      const key = getDetailValidationKey(detail, index)
      const rowErrors = currentErrors[key] ?? {}
      if (rowErrors[field] === hasError) return currentErrors

      const nextRowErrors = { ...rowErrors }
      if (hasError) {
        nextRowErrors[field] = true
      } else {
        delete nextRowErrors[field]
      }

      const nextErrors = { ...currentErrors }
      if (Object.keys(nextRowErrors).length > 0) {
        nextErrors[key] = nextRowErrors
      } else {
        delete nextErrors[key]
      }

      const visibleDetails = details.filter((row) => !row.toDelete)
      setValidationMessage(formatDetailValidationMessage(nextErrors, visibleDetails))
      return nextErrors
    })
  }

  return (
    <form onSubmit={handleEdit} className='mx-auto w-full space-y-8 py-2' noValidate>
      <section>
        <FieldGroup label='Fecha' htmlFor='date' required>
          <Input
            name='date'
            id='date'
            type='date'
            value={toDateInputValue(draft.date)}
            onChange={(event) => {
              setDraft({
                ...draft,
                date: event.target.value,
              })
            }}
          />
        </FieldGroup>
      </section>

      <DocumentDetailsTable<TDetail>
        details={[...details]}
        setDetails={handleDetailsChange}
        mode='edit'
        title={detailsTitle}
        validationErrors={validationErrors}
        onDetailValidationChange={handleDetailValidationChange}
      />

      {validationMessage && (
        <Alert variant='warning' title='Completa los detalles'>
          {validationMessage}
        </Alert>
      )}

      <section className='sticky bottom-0 z-10 flex flex-col-reverse gap-3 border-t border-(--color-border) bg-(--color-bg-surface) pt-4 pb-1 sm:flex-row sm:justify-end'>
        <Button type='button' variant='secondary' onClick={onSuccess} className='w-full sm:w-auto'>
          Cancelar
        </Button>
        <Button type='submit' variant='primary' loading={isSaving} className='w-full sm:w-auto'>
          Guardar
        </Button>
      </section>
    </form>
  )
}
