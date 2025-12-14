import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Modal } from '../../components/modal/Modal'
import ExpensesCreate from './ExpenseCreate'
import Expense from '../../../types/Expense'

interface ExpensesHeaderProps {
    onExpenseCreated: (newExpense: Expense) => void
}

function ExpensesHeader({ onExpenseCreated }: Readonly<ExpensesHeaderProps>) {
    const [open, setOpen] = useState(false)

    return (
        <section className='flex items-center justify-between gap-4 p-2 mr-10 md:mr-5 max-w-fit'>
            <h2 className='text-3xl font-bold tracking-tight'>Gasto</h2>

            <button
                onClick={() => setOpen(true)}
                className='flex items-center justify-center gap-2 p-2 border rounded-lg text-white bg-blue-500 border-gray-50 hover:bg-gray-600 hover:border-gray-800'>
                <Plus className='md:mr-2 h-4 w-4' />
                <p>Nuevo Gasto</p>
            </button>

            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title="Crear Nuevo Gasto"
                description="Completa los detalles del Gasto. Todos los campos son requeridos."
                className="sm:max-w-fit">
                <ExpensesCreate
                    onExpenseCreated={onExpenseCreated}
                    onSuccess={() => setOpen(false)}
                />
            </Modal>
        </section>
    )
}

export default ExpensesHeader
