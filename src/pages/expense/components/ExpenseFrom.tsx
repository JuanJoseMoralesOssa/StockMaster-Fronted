import { useState, useEffect } from 'react'
import Expense from '../../../types/Expense'
import { ExpenseService } from '../../../services/ExpenseService'
import ExpensesDetailsTable from '../../expense_details/ExpenseDetailsTable'
import ExpenseDetails from '../../../types/ExpenseDetails'
import { useToast } from '../../../hooks/useToast'

const expenseService = new ExpenseService()

interface ExpenseCreateProps {
    onExpenseCreated: (newExpense: Expense) => void
    onSuccess: () => void
    initialExpense?: Expense
}

const ExpenseForm = ({ onExpenseCreated, onSuccess, initialExpense }: Readonly<ExpenseCreateProps>) => {
    const [loading, setLoading] = useState(false)

    // Función helper para obtener fecha en formato YYYY-MM-DD desde UTC
    const getLocalDateString = (date: string | Date | undefined): string => {
        if (!date) {
            // Fecha actual
            const now = new Date()
            const year = now.getFullYear()
            const month = String(now.getMonth() + 1).padStart(2, '0')
            const day = String(now.getDate()).padStart(2, '0')
            return `${year}-${month}-${day}`
        }

        // Si es string ISO, simplemente extraer la parte de fecha (UTC)
        if (typeof date === 'string') {
            return date.split('T')[0]
        }

        // Si es Date object, convertir a ISO y extraer fecha
        return date.toISOString().split('T')[0]
    }

    const [expense, setExpense] = useState<Expense>(initialExpense ? {
        ...initialExpense,
        date: getLocalDateString(initialExpense.date)
    } : {
        date: getLocalDateString(undefined),
    })
    const [details, setDetails] = useState<ExpenseDetails[]>(initialExpense?.expense_details || [])

    const { showSuccess, showError } = useToast()

    // Actualizar cuando cambie initialExpense
    useEffect(() => {
        if (initialExpense) {
            setExpense({
                ...initialExpense,
                date: getLocalDateString(initialExpense.date)
            })
            setDetails(initialExpense.expense_details || [])
        }
    }, [initialExpense])

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

        if (details && details.length > 0) {
            expense.expense_details = details
        }
        // else {
        //     showError('Debe agregar al menos un detalle al gasto', 'Error')
        //     setLoading(false)
        //     return
        // }

        try {
            const response = initialExpense && initialExpense.id
                ? await expenseService.updateWithDetails({ ...expense, id: initialExpense.id })
                : await expenseService.createWithDetails(expense)
            onExpenseCreated(response)
            showSuccess(
                initialExpense ? 'Gasto actualizado exitosamente' : 'Gasto creado exitosamente',
                initialExpense ? 'Actualización exitosa' : 'Creación exitosa'
            )
            onSuccess()
        } catch (error) {
            showError(
                initialExpense ? 'Error al actualizar el gasto' : 'Error al crear el gasto',
                'Error'
            )
            console.error('Error creating/updating expense:', error)
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
                        value={expense.date || ''}
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

export default ExpenseForm
