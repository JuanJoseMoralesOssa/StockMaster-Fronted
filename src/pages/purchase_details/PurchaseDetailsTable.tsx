import PurchaseDetails from '../../types/PurchaseDetails'
import DocumentDetailsTable from '../components/common/DocumentDetailsTable'

export default function PurchasesDetailsTable({
    details,
    setDetails,
    mode,
}: Readonly<{
    details: PurchaseDetails[]
    setDetails: (details: PurchaseDetails[]) => void
    mode?: 'add' | 'edit'
}>) {
    return (
        <DocumentDetailsTable<PurchaseDetails>
            details={details}
            setDetails={setDetails}
            mode={mode}
            title="Detalles de la compra"
        />
    )
}
