import ExpenseDetails from '../../types/ExpenseDetails'
import DocumentDetailsTable from '../components/common/DocumentDetailsTable'

export default function ExpensesDetailsTable({
    details,
    setDetails,
    mode,
}: Readonly<{
    details: ExpenseDetails[]
    setDetails: (details: ExpenseDetails[]) => void
    mode?: 'add' | 'edit'
}>) {
    return (
        <DocumentDetailsTable<ExpenseDetails>
            details={details}
            setDetails={setDetails}
            mode={mode}
            title="Detalles del gasto"
        />
    )
}
