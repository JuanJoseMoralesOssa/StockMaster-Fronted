import ExpensesHeader from './components/ExpensesHeader'
import ExpensesTable from './components/ExpensesTable'
import { useServerPagination } from '../../hooks/useServerPagination'
import { ExpenseService } from '../../services/ExpenseService'
import Expense from '../../types/Expense'
import ExpenseFilters from './components/ExpenseFilters'
import { useState } from 'react'
import { useAvailableProducts } from '../../hooks/useAvailableProducts'
import { useAvailableSuppliers } from '../../hooks/useAvailableSuppliers'

const expenseService = new ExpenseService()

function ExpensePage() {
    const date = new Date()
    const [filters, setFilters] = useState({
        startDate:
            date.getFullYear() + '-' +
            (date.getMonth() + 1).toString().padStart(2, '0') + '-' +
            // date.getDate().toString().padStart(2, '0'),
            '01',
        endDate:
            date.getFullYear() + '-' +
            (date.getMonth() + 1).toString().padStart(2, '0') + '-' +
            date.getDate().toString().padStart(2, '0'),
        personId: '',
        productId: '',
        activeDate: false
    });

    const {
        data: expenses,
        loading,
        error,
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage,
        goToPage,
        setItemsPerPage,
        refresh,
        refreshWithFilters,
        addItem,
        updateItem,
        removeItem,
        setActiveFilters
    } = useServerPagination<Expense>({
        fetchFunction: expenseService.getAllPaginatedWithDetails.bind(expenseService),
        fetchWithFilters: expenseService.getAllPaginatedFiltered.bind(expenseService),
        filters: filters,
        initialPage: 1,
        initialLimit: 10,
    })

    const {
        products,
    } = useAvailableProducts()
    const {
        suppliers,
    } = useAvailableSuppliers()

    const handleExpenseCreated = (newExpense: Expense) => {
        addItem(newExpense)
    }

    return (
        <section className="space-y-6">
            <ExpensesHeader onExpenseCreated={handleExpenseCreated} />
            <div className='bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-6 justify-between items-center'>
                <ExpenseFilters
                    filters={filters}
                    setFilters={setFilters}
                    products={products}
                    suppliers={suppliers}
                />
                <div className='flex flex-col md:flex-row gap-2 w-full md:w-fit'>
                    <button
                        onClick={() => {
                            setActiveFilters(true)
                            refreshWithFilters(filters)
                        }}
                        className='px-4 py-2 rounded-2xl w-full md:w-fit text-white transition-colors bg-blue-600 hover:bg-blue-700'>
                        🔍 Buscar Detallado
                    </button>
                    <button
                        onClick={() => {
                            setActiveFilters(false)
                            goToPage(1)
                            setFilters(
                                {
                                    startDate:
                                        date.getFullYear() + '-' +
                                        (date.getMonth() + 1).toString().padStart(2, '0') + '-' +
                                        '01',
                                    endDate:
                                        date.getFullYear() + '-' +
                                        (date.getMonth() + 1).toString().padStart(2, '0') + '-' +
                                        date.getDate().toString().padStart(2, '0'),
                                    personId: '',
                                    productId: '',
                                    activeDate: false
                                }
                            )
                            refresh()
                        }}
                        className='px-4 py-2 rounded-2xl w-full md:w-fit text-white bg-blue-600 hover:text-gray-50 hover:bg-blue-700 transition-colors'>
                        🧹 Limpiar Filtros
                    </button>
                </div>
            </div>
            <ExpensesTable
                expenses={expenses}
                loading={loading}
                error={error}
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                goToPage={goToPage}
                setItemsPerPage={setItemsPerPage}
                refresh={refresh}
                updateItem={updateItem}
                removeItem={removeItem}
            />
        </section >
    )
}

export default ExpensePage
