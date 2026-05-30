import { useState } from 'react'
import Purchase from '../../../types/Purchase'
import { purchaseService } from '../../../services/PurchaseService'
import PurchasesDetailsTable from '../../purchase_details/PurchaseDetailsTable'
import PurchaseDetails from '../../../types/PurchaseDetails'
import { useApiRequest } from '../../../hooks/useApiRequest'
import { Button, Input, Label } from '../../../components/ui'
import { todayBogota } from '../../../utils/date'

interface PurchaseCreateProps {
    onPurchaseCreated: (newPurchase: Purchase) => void
    onSuccess: () => void
}

const PurchaseCreate = ({ onPurchaseCreated, onSuccess }: Readonly<PurchaseCreateProps>) => {
    const [purchase, setPurchase] = useState<Purchase>({
        date: todayBogota(),
    })
    const [details, setDetails] = useState<PurchaseDetails[]>([])

    const { loading, execute } = useApiRequest(
        (data: Purchase) => purchaseService.createWithDetails(data),
        {
            successMessage: 'Compra creada exitosamente',
            errorMessage: 'Error al crear la compra',
            showSuccessToast: true,
            onSuccess: (response) => {
                onPurchaseCreated(response)
                onSuccess()
            }
        }
    )

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target
        setPurchase({
            ...purchase,
            [name]: value,
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        if (loading) return
        e.preventDefault()

        const purchaseToSubmit = { ...purchase }
        if (details && details.length > 0) {
            purchaseToSubmit.purchase_details = details
        }

        await execute(purchaseToSubmit)
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
                            if (!purchase.date) return ''
                            if (/^\d{4}-\d{2}-\d{2}$/.test(purchase.date)) return purchase.date
                            const d = new Date(purchase.date)
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
            <PurchasesDetailsTable
                details={details}
                setDetails={setDetails}
                mode='add'
            />
        </form>
    )
}

export default PurchaseCreate
