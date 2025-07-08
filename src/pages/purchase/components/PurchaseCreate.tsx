import { useState } from 'react'
import Purchase from '../../../types/Purchase'
import { PurchaseService } from '../../../services/PurchaseService'
import PurchasesDetailsTable from '../../purchase_details/PurchaseDetailsTable'
import PurchaseDetails from '../../../types/PurchaseDetails'
import { useToast } from '../../../hooks/useToast'

const purchaseService = new PurchaseService()

interface PurchaseCreateProps {
    onPurchaseCreated: (newPurchase: Purchase) => void
    onSuccess: () => void
}

const PurchaseCreate = ({ onPurchaseCreated, onSuccess }: Readonly<PurchaseCreateProps>) => {
    const [loading, setLoading] = useState(false)
    const [purchase, setPurchase] = useState<Purchase>({
        date: new Date().toISOString(),
        total_kg: 0,
    })
    const [details, setDetails] = useState<PurchaseDetails[]>([])

    const { showSuccess, showError } = useToast()

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
        setLoading(true)

        const total_kg = details?.reduce((acc, detail) => {
            if (detail.toCreate && !detail.toDelete && !detail.toUpdate) {
                return acc + (detail.weight_kg ?? 0)
            }
            return acc
        }, 0)

        const purchaseWithDetails = {
            ...purchase,
            total_kg: total_kg ?? 0,
            purchase_details: details?.filter((d) => d.toCreate && !d.toDelete && !d.toUpdate),
        }

        try {
            const response = await purchaseService.createWithDetails(purchaseWithDetails)
            onPurchaseCreated(response)
            showSuccess('Compra creada exitosamente', 'Creación exitosa')
            onSuccess()
        } catch (error) {
            showError('Error al crear la compra', 'Error')
            console.error('Error creating purchase:', error)
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
                        value={new Date(purchase.date).toISOString().split('T')[0]}
                        required
                        onChange={handleChange}
                        className='mt-1 p-1 inline-flex md:order-2 border w-fit rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:outline-none focus:ring-indigo-500 sm:text-sm'
                    />
                </section>
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
