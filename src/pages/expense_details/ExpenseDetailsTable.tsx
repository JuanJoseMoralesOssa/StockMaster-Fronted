import { useEffect, useState } from 'react'
import ExpenseRow from './components/ExpenseRow'
import ExpenseDetails from '../../types/ExpenseDetails'
import { useDetailsSummary } from '../../hooks/useDetailsSummary'
import { useProductStore } from '../../stores/useProductStore'
import { useSupplierStore } from '../../stores/useSupplierStore'
import SummaryTable from '../components/common/SummaryTable'

export default function ExpensesDetailsTable({
    details,
    setDetails,
    mode,
}: Readonly<{
    details: ExpenseDetails[]
    setDetails: (details: ExpenseDetails[]) => void
    mode?: string
}>) {
    const [expensesLength, setExpensesLength] = useState(details.length ?? 0)
    const {
        products,
        isLoading: productsLoading,
        error: productsError,
        fetchProducts,
        refreshProducts,
    } = useProductStore()
    const {
        suppliers,
        isLoading: suppliersLoading,
        error: suppliersError,
        fetchSuppliers,
        refreshSuppliers,
    } = useSupplierStore()

    useEffect(() => {
        fetchProducts()
        fetchSuppliers()
    }, [fetchProducts, fetchSuppliers])

    const { productSummary } = useDetailsSummary(details)

    useEffect(() => {
        setExpensesLength(details.filter((row) => !row.toDelete).length)
    }, [details])

    const addExpense = (e: React.FormEvent) => {
        e.preventDefault()
        const newExpenses = [
            ...details,
            {
                id: -Date.now(),
                productId: 0,
                product: { id: 0, name: '' },
                personId: 0,
                person: { id: 0, name: '' },
                toCreate: true,
            },
        ]
        setDetails(newExpenses)
    }

    const deleteExpense = (id: number) => {
        const createdAndDeleted = id < 0
        if (createdAndDeleted) {
            setDetails(details.filter((val: ExpenseDetails) => val.id !== id))
            return
        }
        const newExpenses = details.map((row) => {
            if (row.id === id) {
                return { id: row.id, toDelete: true }
            }
            return row
        })
        setDetails(newExpenses)
    }

    type ExpenseUpdateValue =
        | { id: string | number; name: unknown }
        | null
        | number
        | string

    const updateExpense = (id: number, field: string, value: ExpenseUpdateValue) => {
        const newExpenses = details.map((row) => {
            if (row.id === id) {
                const updatedRow = { ...row, [field]: value }
                if (field === 'product' && value && typeof value === 'object' && 'id' in value) {
                    updatedRow.productId = value.id as number
                } else if (field === 'person' && value && typeof value === 'object' && 'id' in value) {
                    updatedRow.personId = value.id as number
                }
                if (mode === 'edit' && !updatedRow.toCreate) {
                    updatedRow.toUpdate = true
                }
                return updatedRow
            }
            return row
        })
        setDetails(newExpenses)
    }

    // Si hay datos cargando, mostrar un indicador de carga
    if (productsLoading || suppliersLoading) {
        return <div className='p-4 text-center'>Cargando datos...</div>
    }

    // Si hay errores, mostrar un mensaje de error
    if (productsError || suppliersError) {
        return (
            <div className='p-4 bg-red-50 border border-red-200 rounded-md text-red-600'>
                <p className='font-medium'>Error al cargar datos:</p>
                <p>{productsError?.message ?? suppliersError?.message}</p>
                <button
                    className='mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded-md text-sm'
                    onClick={() => {
                        if (productsError) refreshProducts()
                        if (suppliersError) refreshSuppliers()
                    }}>
                    Reintentar
                </button>
            </div>
        )
    }

    return (
        <div className='px-2 py-1 min-w-2xl flex flex-col items-center justify-center w-fit overflow-x-auto sm:overflow-visible'>
            <section className='w-full flex flex-col md:flex-row items-center justify-between md:justify-around gap-2 p-1 mb-6'>
                <h2 className='text-lg font-medium tracking-tight'>
                    Detalles del gasto
                </h2>
                <button
                    className='mb-2 flex w-full md:w-fit items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'
                    onClick={addExpense}>
                    Agregar Producto
                </button>
            </section>


            {expensesLength > 0 && (
                <table className='w-fit border border-gray-50 rounded-xl table-auto text-sm sm:text-base mb-6'>
                    <thead>
                        <tr className='bg-gray-50 text-left text-gray-600 uppercase text-xs sm:text-sm'>
                            <th className='text-left p-2'>Producto</th>
                            <th className='text-left p-2'>Proveedor</th>
                            <th className='text-left p-2'>kg</th>
                            <th className='text-center'>Acciones</th>
                        </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                        {details.map((expense) => (
                            !expense.toDelete && <ExpenseRow
                                key={`${expense.id ?? ''}${expense.expenseId ?? ''}`}
                                expense={expense}
                                onUpdate={updateExpense}
                                onDelete={deleteExpense}
                                products={products}
                                suppliers={suppliers}
                            />
                        ))}
                    </tbody>
                </table>
            )}

            {/* Tablas de resumen */}
            {productSummary.length > 0 && expensesLength > 0 && (
                <div className='flex flex-col w-fit justify-center mb-6'>
                    {/* Tabla de total por producto en peso (kg) */}
                    <SummaryTable
                        data={productSummary}
                        title='Total por producto (kg)'
                        valueLabel='Total (kg)'
                        valueField='total_weight'
                    />
                </div>
            )}
        </div>
    )
}
