import { useState } from 'react'
import { useToast } from '@/hooks/useToast'
import { extractErrorInfo } from '@/utils/error'
import { FieldGroup, Input, Button } from '@/components/ui'
import { toDateInputValue } from '@/utils/date'
import DocumentDetailsTable from '@/pages/components/common/DocumentDetailsTable'
import type { DocumentDetailLike, DocumentLike } from '@/types/DocumentBase'

export interface DocumentEditMessages {
  missingId: string
  missingDate: string
  success: string
  error: string
}

interface DocumentEditFormProps<TDoc, K extends string> {
  initialDocument: TDoc
  service: { updateWithDetails: (doc: TDoc) => Promise<TDoc> }
  detailsKey: K
  detailsTitle: string
  messages: DocumentEditMessages
  onSuccess: () => void
  onItemUpdated: (item: TDoc) => void
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
}: Readonly<DocumentEditFormProps<TDoc, K>>) {
  const [isSaving, setIsSaving] = useState(false)
  // Borrador local: snapshot del documento al abrir el modal de edición.
  const [draft, setDraft] = useState<TDoc>(initialDocument)
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

      const payload: TDoc = { ...draft }
      if (payload.date.includes('T')) {
        payload.date = payload.date.split('T')[0]
      }

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
      />

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
