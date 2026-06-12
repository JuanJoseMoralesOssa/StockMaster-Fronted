import { useState } from 'react'
import Purchase from '../../../types/Purchase'
import PurchaseDetails from '../../../types/PurchaseDetails'
import { purchaseService } from '../../../services/PurchaseService'
import PurchasesDetailsTable from '../../purchase_details/PurchaseDetailsTable'
import { useToast } from '../../../hooks/useToast'
import { extractErrorInfo } from '../../../utils/error'
import { FieldGroup, Input, Button } from '../../../components/ui'
import { toDateInputValue } from '../../../utils/date'

interface PurchaseEditFormProps {
  purchase: Purchase
  onSuccess: () => void
  onItemUpdated: (item: Purchase) => void
}

export default function PurchaseEditForm({ purchase, onSuccess, onItemUpdated }: Readonly<PurchaseEditFormProps>) {
  const [isSaving, setIsSaving] = useState(false)
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase>(purchase)
  const { showSuccess, showError } = useToast()

  const handleEdit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSaving(true)

    try {
      if (!selectedPurchase.id) {
        showError('Error al editar la compra: ID no definido', 'Error')
        return
      }

      if (!selectedPurchase.date) {
        showError('Error al editar la compra: Fecha no definida', 'Error')
        return
      }

      const payload: Purchase = { ...selectedPurchase }
      if (payload.date.includes('T')) {
        payload.date = payload.date.split('T')[0]
      }

      const updatedPurchase = await purchaseService.updateWithDetails(payload)
      onItemUpdated(updatedPurchase)
      showSuccess('Compra actualizada exitosamente', 'Actualización exitosa')
      onSuccess()
    } catch (error: unknown) {
      const { message: msg } = extractErrorInfo(error)
      showError(msg || 'Error al actualizar la compra', 'Error')
      console.error('Error updating purchase:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleEdit} className='mx-auto w-full max-w-3xl space-y-8 py-2' noValidate>
      <section>
        <FieldGroup label='Fecha' htmlFor='date' required>
          <Input
            name='date'
            id='date'
            type='date'
            value={toDateInputValue(selectedPurchase.date)}
            onChange={(event) => {
              setSelectedPurchase({
                ...selectedPurchase,
                date: event.target.value,
              })
            }}
          />
        </FieldGroup>
      </section>

      <PurchasesDetailsTable
        details={[...(selectedPurchase.purchase_details ?? [])]}
        setDetails={(details: PurchaseDetails[]) => {
          const total_kg = details.reduce((acc, detail) => {
            if (detail.toCreate) {
              return acc + (detail.weight_kg ?? 0)
            }
            return acc
          }, 0)

          setSelectedPurchase({
            ...selectedPurchase,
            total_kg,
            purchase_details: details,
          })
        }}
        mode='edit'
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
