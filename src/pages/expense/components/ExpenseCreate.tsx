import { useState } from 'react'
import Expense from '../../../types/Expense'
import { ExpenseService } from '../../../services/ExpenseService'
import ExpensesDetailsTable from '../../expense_details/ExpenseDetailsTable'
import ExpenseDetails from '../../../types/ExpenseDetails'
import { useToast } from '../../../hooks/useToast'

const expenseService = new ExpenseService()

interface ExpenseCreateProps {
    onExpenseCreated: (newExpense: Expense) => void
    onSuccess: () => void
}

const ExpenseCreate = ({ onExpenseCreated, onSuccess }: Readonly<ExpenseCreateProps>) => {
    const [loading, setLoading] = useState(false)
    const [expense, setExpense] = useState<Expense>({
        date: new Date().toISOString().split('T')[0],
        total_kg: 0,
    })
    const [details, setDetails] = useState<ExpenseDetails[]>([])

    const { showSuccess, showError } = useToast()

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
        setLoading(true)
        const total_kg = details?.reduce((acc, detail) => {
            if (detail.toCreate && !detail.toDelete && !detail.toUpdate) {
                return acc + (detail.weight_kg ?? 0)
            }
            return acc
        }, 0)

        const expenseDetails = details?.filter((d) => d.toCreate && !d.toDelete && !d.toUpdate)
        const expenseWithDetails = {
            ...expense,
            total_kg: total_kg ?? 0,
        }
        if (expenseDetails && expenseDetails.length > 0) {
            expenseWithDetails.expense_details = expenseDetails
        }
        // else {
        //     showError('Debe agregar al menos un detalle al gasto', 'Error')
        //     setLoading(false)
        //     return
        // }

        try {
            const response = await expenseService.createWithDetails(expenseWithDetails)
            onExpenseCreated(response)
            showSuccess('Gasto creado exitosamente', 'Creación exitosa')
            onSuccess()
        } catch (error) {
            showError('Error al crear el gasto', 'Error')
            console.error('Error creating expense:', error)
        }
        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className='space-y-4 px-2 w-fit'>
            <section className='md:flex md:items-center md:justify-between gap-1 md:space-x-4 pt-1'>
                <button
                    type='submit'
                    className='inline-flex mb-3 md:mb-0 md:order-3 w-full md:w-fit md:ml-4 justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                    Guardar
                </button>
                <section className='flex flex-col items-center md:flex-row gap-1 md:space-x-4'>
                    <label
                        htmlFor='date'
                        className='inline-flex md:order-1 text-sm font-medium text-gray-700'>
                        Fecha
                    </label>
                    <input
                        type='date'
                        name='date'
                        id='date'
                        value={(() => {
                            const date = new Date(expense.date);
                            return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
                        })()}
                        required
                        onChange={handleChange}
                        className='mt-1 p-1 inline-flex md:order-2 border w-fit rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:outline-none focus:ring-indigo-500 sm:text-sm'
                    />
                </section>
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
