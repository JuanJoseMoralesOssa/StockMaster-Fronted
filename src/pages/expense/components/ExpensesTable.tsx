import { Pencil, Trash2 } from 'lucide-react'
import { Fragment, useState } from 'react'
import { Modal } from '../../components/modal/Modal'
import Expense from '../../../types/Expense'
import { ExpenseService } from '../../../services/ExpenseService'
import Pagination from '../../components/pagination/Pagination'
import ExpensesDetailsTable from '../../expense_details/ExpenseDetailsTable'
import ExpenseDetails from '../../../types/ExpenseDetails'
import { useAvailableProducts } from '../../../hooks/useAvailableProducts'
import { useAvailableSuppliers } from '../../../hooks/useAvailableSuppliers'
import { useToast } from '../../../hooks/useToast'

const expenseService = new ExpenseService()

const headersTable = ['Ver', 'Fecha', 'Total kg', 'Productos', 'Proveedores', 'Detalles', 'Acciones']

interface ExpensesTableProps {
    expenses: Expense[]
    loading: boolean
    error: string | null
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    goToPage: (page: number) => void
    setItemsPerPage: (limit: number) => void
    refresh: () => void
    updateItem: (updatedItem: Expense, idField?: keyof Expense) => void
    removeItem: (itemId: string | number, idField?: keyof Expense) => void
}

export default function ExpensesTable({
    expenses,
    loading,
    error,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    goToPage,
    setItemsPerPage,
    refresh,
    updateItem,
    removeItem
}: Readonly<ExpensesTableProps>) {
    const [isLoading, setIsLoading] = useState(false)
    const [selectedExpense, setSelectedExpense] = useState<Expense>({} as Expense)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [expandedExpenses, setExpandedExpenses] = useState<number[]>([])

    const { showSuccess, showError, confirmDelete } = useToast()

    const {
        products,
    } = useAvailableProducts()
    const {
        suppliers,
    } = useAvailableSuppliers()

    const toggleExpenseExpansion = (expenseId: number | undefined) => {
        if (!expenseId) return
        setExpandedExpenses(prev =>
            prev.includes(expenseId)
                ? prev.filter(id => id !== expenseId)
                : [...prev, expenseId]
        )
    }

    const handleDelete = async (expense: Expense) => {
        const id = expense.id
        if (!id) return
        const confirmed = await confirmDelete(
            `¿Estás seguro de que deseas eliminar el gasto del <span class="font-semibold text-red-600">${(() => {
                const date = new Date(expense.date ?? '')
                date.setTime(date.getTime() + new Date().getTimezoneOffset() * 60000)
                return date.toLocaleDateString('es-ES')
            })()}</span>?`,
            'Eliminar Gasto'
        )

        if (!confirmed) return

        try {
            await expenseService.delete(id)
            await expenseService.deleteWithDetails(id)
            removeItem(id)
            showSuccess('Gasto eliminado exitosamente', 'Eliminación exitosa')
        } catch (error) {
            showError('Error al eliminar el gasto', 'Error')
            console.error('Error deleting expense:', error)
        }
    }

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        if (!selectedExpense.id) {
            showError('Error al editar el gasto: ID no definido', 'Error')
            setIsLoading(false)
            return
        }
        if (!selectedExpense.date) {
            showError('Error al editar el gasto: Fecha no definida', 'Error')
            setIsLoading(false)
            return
        }
        if (selectedExpense.date.includes('T')) {
            selectedExpense.date = selectedExpense.date.split('T')[0]
        }
        try {
            const updatedExpense = await expenseService.updateWithDetails(selectedExpense)
            if (updatedExpense) {
                updateItem(updatedExpense)
                showSuccess('Gasto actualizado exitosamente', 'Actualización exitosa')
                setIsEditModalOpen(false)
            }
        } catch (error) {
            showError('Error al actualizar el gasto', 'Error')
            console.error('Error updating expense:', error)
        }
        setIsLoading(false)
    }

    // Loading state
    if (loading) {
        return <div className='p-4 text-center'>Cargando gastos...</div>
    }

    // Error state
    if (error) {
        return (
            <div className='p-4 bg-red-50 border border-red-200 rounded-md text-red-600'>
                <p className='font-medium'>Error al cargar gastos:</p>
                <p>{error}</p>
                <button
                    className='mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded-md text-sm'
                    onClick={() => refresh()}>
                    Reintentar
                </button>
            </div>
        )
    }

    return (
        <section className='px-2 py-4 overflow-x-auto sm:overflow-visible'>
            <table className='w-full border border-gray-50 rounded-xl table-auto text-sm sm:text-base'>
                <thead>
                    <tr className='bg-gray-50 text-left text-gray-600 uppercase text-xs sm:text-sm'>
                        {headersTable.map((header) => (
                            <th key={'ExpenseHeader' + header} className='p-2'>
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                    {expenses.map((expense) => (
                        <Fragment key={expense.id}>
                            {/* Fila principal del gasto */}
                            <tr className='text-sm sm:text-base hover:bg-gray-50'>
                                {/* Columna de expansión */}
                                <td className='p-2 whitespace-nowrap w-12'>
                                    <button
                                        onClick={() => toggleExpenseExpansion(expense.id)}
                                        className="text-gray-400 hover:text-gray-600 transition-colors w-5 h-5 flex items-center justify-center"
                                        title="Ver detalles"
                                    >
                                        {expense.id && expandedExpenses.includes(expense.id) ? '▼' : '▶'}
                                    </button>
                                </td>

                                {/* Fecha */}
                                <td className='p-2 whitespace-nowrap'>
                                    {(() => {
                                        if (!expense.date) return 'Fecha no disponible'
                                        const offset = new Date().getTimezoneOffset() * 60000 // offset en mil
                                        const date = new Date(expense.date)
                                        date.setTime(date.getTime() + offset)
                                        if (isNaN(date.getTime())) return 'Fecha inválida'
                                        return date.toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                        })
                                    })()}
                                </td>

                                {/* Total KG */}
                                <td className='p-2 whitespace-nowrap'>
                                    {`${expense.total_kg ? expense.total_kg + 'kg' : '-'}`}
                                </td>

                                {/* Productos (resumen) */}
                                <td className='p-2 whitespace-nowrap'>
                                    {expense.expense_details && expense.expense_details.length > 0 ? (
                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                            {(() => {
                                                const uniqueProducts = expense.expense_details.reduce((acc: number[], detail) => {
                                                    const productId = detail.productId
                                                    if (productId && !acc.includes(productId)) {
                                                        acc.push(productId)
                                                    }
                                                    return acc
                                                }, [])
                                                const count = uniqueProducts.length
                                                return `${count} producto${count !== 1 ? 's' : ''}`
                                            })()}
                                        </span>
                                    ) : (
                                        <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs">
                                            Sin productos
                                        </span>
                                    )}
                                </td>

                                {/* Proveedores (resumen) */}
                                <td className='p-2 whitespace-nowrap'>
                                    {expense.expense_details && expense.expense_details.length > 0 ? (
                                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                                            {(() => {
                                                const uniqueSuppliers = expense.expense_details.reduce((acc: number[], detail) => {
                                                    const personId = detail.personId
                                                    if (personId && !acc.includes(personId)) {
                                                        acc.push(personId)
                                                    }
                                                    return acc
                                                }, [])
                                                const count = uniqueSuppliers.length
                                                return `${count} proveedor${count !== 1 ? 'es' : ''}`
                                            })()}
                                        </span>
                                    ) : (
                                        <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs">
                                            Sin proveedores
                                        </span>
                                    )}
                                </td>

                                {/* Detalles (resumen) */}
                                <td className='p-2 whitespace-nowrap'>
                                    {expense.expense_details && expense.expense_details.length > 0 ? (
                                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                                            {expense.expense_details.length} detalle{expense.expense_details.length !== 1 ? 's' : ''}
                                        </span>
                                    ) : (
                                        <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs">
                                            Sin detalles
                                        </span>
                                    )}
                                </td>

                                {/* Acciones */}
                                <td className='p-2 flex gap-4 cursor-pointer text-center'
                                    onClick={() => setSelectedExpense(expense)}
                                >
                                    {!isLoading ? (
                                        <button className='flex items-center text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded text-sm'
                                            onClick={() => {
                                                setIsLoading(true)
                                                setIsEditModalOpen(true)
                                                setIsLoading(false)
                                            }}
                                            disabled={isLoading}>
                                            <Pencil className='mr-2 h-4 w-4' />
                                            <span>Editar</span>
                                        </button>
                                    ) : <span>Cargando...</span>}
                                    {!isLoading ? (
                                        <button className='flex items-center text-red-600 hover:text-red-800 bg-red-50 px-2 py-1 rounded text-sm'
                                            onClick={() => {
                                                setIsLoading(true)
                                                handleDelete(expense)
                                                setIsLoading(false)
                                            }}>
                                            <Trash2 className='mr-2 h-4 w-4' />
                                            <span>Eliminar</span>
                                        </button>
                                    ) : <span>Cargando...</span>}
                                </td>
                            </tr>

                            {/* Fila expandible con detalles */}
                            {expense.id && expandedExpenses.includes(expense.id) && expense.expense_details && expense.expense_details.length > 0 && (
                                <tr>
                                    <td colSpan={headersTable.length} className="px-0 py-0">
                                        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
                                            <h4 className="text-sm font-medium text-gray-700 mb-3">
                                                Detalles del Gasto del {(() => {
                                                    const date = new Date(expense.date)
                                                    date.setTime(date.getTime() + new Date().getTimezoneOffset() * 60000)
                                                    return date.toLocaleDateString('es-ES')
                                                })()}
                                            </h4>
                                            <div className="bg-white rounded border border-gray-200 overflow-hidden">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-gray-100">
                                                        <tr>
                                                            <th className="px-4 py-2 text-left font-medium text-gray-700">Producto</th>
                                                            <th className="px-4 py-2 text-left font-medium text-gray-700">Proveedor</th>
                                                            <th className="px-4 py-2 text-left font-medium text-gray-700">Peso (KG)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {expense.expense_details.map((detail) => (
                                                            <tr key={detail.id} className="hover:bg-gray-50">
                                                                <td className="px-4 py-2 text-gray-900">
                                                                    {products.find(p => p.id === detail.productId)?.name || detail.productId}
                                                                </td>
                                                                <td className="px-4 py-2 text-gray-900">
                                                                    {suppliers.find(s => s.id === detail.personId)?.name || detail.personId}
                                                                </td>
                                                                <td className="px-4 py-2 text-gray-900">
                                                                    {detail.weight_kg} kg
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </Fragment>
                    ))}
                </tbody>
            </table>

            {/* Edit Modal */}
            <Modal
                className="sm:max-w-fit"
                open={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}>
                <h2 className='text-xl font-semibold mb-4'>Editar Gasto</h2>
                <form onSubmit={handleEdit} className='w-fit px-2 pr-5 '>
                    <section className='mb-4'>
                        <label
                            htmlFor='date'
                            className='block text-sm font-medium text-gray-700'>
                            Fecha
                        </label>
                        <input
                            name='date'
                            id='date'
                            type='date'
                            value={(() => {
                                if (!selectedExpense.date) return ''
                                const offset = new Date().getTimezoneOffset() * 60000
                                const date = new Date(selectedExpense.date)
                                date.setTime(date.getTime() + offset)
                                if (isNaN(date.getTime())) return ''
                                return date.toISOString().split('T')[0]
                            })()}
                            onChange={(e) => {
                                const date = new Date(e.target.value)
                                setSelectedExpense({
                                    ...selectedExpense,
                                    date: date.toISOString().split('T')[0],
                                })
                            }}
                            className='mt-1 min-w-fit w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                        />
                    </section>

                    <ExpensesDetailsTable
                        details={[
                            ...(selectedExpense.expense_details ?? []),
                        ]}
                        setDetails={(details: ExpenseDetails[]) => {
                            const total_kg = details.reduce(
                                (acc, detail) => {
                                    if (detail.toCreate) {
                                        return acc + (detail.weight_kg ?? 0)
                                    }
                                    return acc
                                },
                                0
                            )

                            setSelectedExpense({
                                ...selectedExpense,
                                total_kg: total_kg,
                                expense_details: details,
                            })
                        }}
                        mode='edit'
                    />

                    <section className='w-full flex flex-col sm:flex-row gap-2 sm:justify-end'>
                        <button
                            type='button'
                            onClick={() => setIsEditModalOpen(false)}
                            className='mr-2 inline-flex w-full sm:w-fit justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'>
                            Cancelar
                        </button>
                        <button
                            disabled={isLoading}
                            type='submit'
                            className='inline-flex w-full sm:w-fit justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                            Guardar
                        </button>
                    </section>
                </form>
            </Modal>

            {/* Pagination */}
            <div className="mt-4">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={goToPage}
                    onItemsPerPageChange={setItemsPerPage}
                />
            </div>
        </section >
    )
}
