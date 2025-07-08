import ExpensesHeader from './components/ExpensesHeader'
import ExpensesTable from './components/ExpensesTable'
import { useServerPagination } from '../../hooks/useServerPagination'
import { ExpenseService } from '../../services/ExpenseService'
import Expense from '../../types/Expense'

const expenseService = new ExpenseService()

function ExpensePage() {
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
        addItem,
        updateItem,
        removeItem
    } = useServerPagination<Expense>({
        fetchFunction: expenseService.getAllPaginatedWithDetails.bind(expenseService),
        initialPage: 1,
        initialLimit: 10,
    })

    const handleExpenseCreated = (newExpense: Expense) => {
        addItem(newExpense)
    }

    return (
        <section className="space-y-6">
            <ExpensesHeader onExpenseCreated={handleExpenseCreated} />
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
        </section>
    )
}

export default ExpensePage
