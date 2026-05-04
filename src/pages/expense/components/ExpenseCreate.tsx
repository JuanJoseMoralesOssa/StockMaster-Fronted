import { useState } from 'react'
import Expense from '../../../types/Expense'
import { expenseService } from '../../../services/ExpenseService'
import ExpensesDetailsTable from '../../expense_details/ExpenseDetailsTable'
import ExpenseDetails from '../../../types/ExpenseDetails'
import { useApiRequest } from '../../../hooks/useApiRequest'
import { Button, Input, Label } from '../../../components/ui'

interface ExpenseCreateProps {
    onExpenseCreated: (newExpense: Expense) => void
    onSuccess: () => void
}

const ExpenseCreate = ({ onExpenseCreated, onSuccess }: Readonly<ExpenseCreateProps>) => {
    const [expense, setExpense] = useState<Expense>({
        date: (() => {
            const d = new Date()
            const parts = new Intl.DateTimeFormat('en-US', {
                timeZone: 'America/Bogota',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).formatToParts(d)
            const year = parts.find(p => p.type === 'year')?.value
            const month = parts.find(p => p.type === 'month')?.value
            const day = parts.find(p => p.type === 'day')?.value
            return `${year}-${month}-${day}`
        })(),
    })
    const [details, setDetails] = useState<ExpenseDetails[]>([])

    const { loading, execute } = useApiRequest(
        (data: Expense) => expenseService.createWithDetails(data),
        {
            successMessage: 'Gasto creado exitosamente',
            errorMessage: 'Error al crear el gasto',
            showSuccessToast: true,
            onSuccess: (response) => {
                onExpenseCreated(response)
                onSuccess()
            }
        }
    )

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target
        setExpense({
            ...expense,
            [name]: value,
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        if (loading) return
        e.preventDefault()

        const expenseToSubmit = { ...expense }
        if (details && details.length > 0) {
            expenseToSubmit.expense_details = details
        }

        await execute(expenseToSubmit)
    }

    return (
        <form onSubmit={handleSubmit} className='mx-auto w-full max-w-3xl space-y-8 px-4 py-6' noValidate>
            <section className='flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4'>
                <div className='flex flex-col gap-2'>
                    <Label htmlFor='date' required>
                        Fecha
                    </Label>
                    <Input
                        type='date'
                        name='date'
                        id='date'
                        value={(() => {
                            if (!expense.date) return ''
                            if (/^\d{4}-\d{2}-\d{2}$/.test(expense.date)) return expense.date
                            const d = new Date(expense.date)
                            if (isNaN(d.getTime())) return ''
                            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
                        })()}
                        required
                        onChange={handleChange}
                    />
                </div>
                <Button
                    type='submit'
                    loading={loading}
                    variant='primary'
                    className='w-full sm:w-auto'
                >
                    Guardar
                </Button>
            </section>
            <ExpensesDetailsTable
                details={details}
                setDetails={setDetails}
                mode='add'
            />
        </form>
    )
}

export default ExpenseCreate
