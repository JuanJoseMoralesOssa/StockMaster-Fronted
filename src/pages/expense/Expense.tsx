import Person from '../../types/Person'
import Product from '../../types/Product'
import ExpensesHeader from './components/ExpensesHeader'
import ExpensesTable from './components/ExpensesTable'

function Expense() {
    return (
        <section>
            <ExpensesHeader />
            <ExpensesTable />
        </section>
    )
}

export default Expense
