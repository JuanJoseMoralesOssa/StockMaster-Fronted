import { useState } from 'react'
import Expense from '../../../types/Expense'
import ExpenseDetails from '../../../types/ExpenseDetails'
import { expenseService } from '../../../services/ExpenseService'
import ExpensesDetailsTable from '../../expense_details/ExpenseDetailsTable'
import { useToast } from '../../../hooks/useToast'
import { extractErrorInfo } from '../../../utils/error'
import { FieldGroup, Input, Button } from '../../../components/ui'
import { toDateInputValue } from '../../../utils/date'

interface ExpenseEditFormProps {
  expense: Expense
  onSuccess: () => void
  onItemUpdated: (item: Expense) => void
}

export default function ExpenseEditForm({ expense, onSuccess, onItemUpdated }: Readonly<ExpenseEditFormProps>) {
  const [isSaving, setIsSaving] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense>(expense)
  const { showSuccess, showError } = useToast()

  const handleEdit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSaving(true)

    try {
      if (!selectedExpense.id) {
        showError('Error al editar el gasto: ID no definido', 'Error')
        return
      }

      if (!selectedExpense.date) {
        showError('Error al editar el gasto: Fecha no definida', 'Error')
        return
      }

      const payload: Expense = { ...selectedExpense }
      if (payload.date.includes('T')) {
        payload.date = payload.date.split('T')[0]
      }

      const updatedExpense = await expenseService.updateWithDetails(payload)
      onItemUpdated(updatedExpense)
      showSuccess('Gasto actualizado exitosamente', 'Actualización exitosa')
      onSuccess()
    } catch (error: unknown) {
      const { message: msg } = extractErrorInfo(error)
      showError(msg || 'Error al actualizar el gasto', 'Error')
      console.error('Error updating expense:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleEdit} className='mx-auto w-full max-w-3xl space-y-8 px-4 py-6' noValidate>
      <section>
        <FieldGroup label='Fecha' htmlFor='date' required>
          <Input
            name='date'
            id='date'
            type='date'
            value={toDateInputValue(selectedExpense.date)}
            onChange={(event) => {
              setSelectedExpense({
                ...selectedExpense,
                date: event.target.value,
              })
            }}
          />
        </FieldGroup>
      </section>

      <ExpensesDetailsTable
        details={[...(selectedExpense.expense_details ?? [])]}
        setDetails={(details: ExpenseDetails[]) => {
          const total_kg = details.reduce((acc, detail) => {
            if (detail.toCreate) {
              return acc + (detail.weight_kg ?? 0)
            }
            return acc
          }, 0)

          setSelectedExpense({
            ...selectedExpense,
            total_kg,
            expense_details: details,
          })
        }}
        mode='edit'
      />

      <section className='flex flex-col-reverse sm:flex-row gap-3 sm:justify-end'>
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
