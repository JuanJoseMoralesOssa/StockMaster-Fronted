import { useEffect, useState } from 'react'
import ExpenseRow from './components/ExpenseRow'
import ExpenseDetails from '../../types/ExpenseDetails'
import { useExpenseSummary } from '../../hooks/useExpenseSummary'
import { useAvailableProducts } from '../../hooks/useAvailableProducts'
import { useAvailableSuppliers } from '../../hooks/useAvailableSuppliers'
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
        loading: productsLoading,
        error: productsError,
        refreshProducts,
    } = useAvailableProducts()
    const {
        suppliers,
        loading: suppliersLoading,
        error: suppliersError,
        refreshSuppliers,
    } = useAvailableSuppliers()

    const { productSummary } = useExpenseSummary(details)

    useEffect(() => {
        setExpensesLength(details.filter((row) => !row.toDelete).length)
    }, [details])

    const addExpense = (e: React.FormEvent) => {
        e.preventDefault()
        const newExpenses = [
            ...details,
            {
                id: Date.now(),
                toCreate: true,
                toUpdate: false,
                toDelete: false,
                productId: 0,
                product: { id: 0, name: '' },
                personId: 0,
                person: { id: 0, name: '' },
            },
        ]
        setDetails(newExpenses)
    }

    const deleteExpense = (id: number) => {
        const newExpenses = details.map((row) => {
            if (row.id === id) {
                if (mode === 'add') {
                    return { ...row, toDelete: true, toCreate: true, toUpdate: false }
                }
                return { ...row, toDelete: true, toUpdate: true, toCreate: false }
            }
            return row
        })
        setDetails(newExpenses)
    }

    const updateExpense = (id: number, field: string, value: any) => {

        const newExpenses = details.map((row) => {
            if (row.id === id) {
                const updatedRow = { ...row, [field]: value };
                if (field === 'product') {
                    updatedRow.productId = value.id;
                } else if (field === 'person') {
                    updatedRow.personId = value.id;
                }
                if (mode === 'add') {
                    updatedRow.toUpdate = !updatedRow.toCreate;
                } else if (mode === 'edit') {
                    if (updatedRow.toCreate) {
                        updatedRow.toUpdate = false;
                    } else {
                        updatedRow.toUpdate = true;
                    }
                }
                updatedRow.toDelete = false;
                return updatedRow;
            }
            return row;
        });
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
