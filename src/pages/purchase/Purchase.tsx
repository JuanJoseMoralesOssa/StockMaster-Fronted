import PurchasesHeader from './components/PurchasesHeader'
import PurchasesTable from './components/PurchasesTable'
import { useServerPagination } from '../../hooks/useServerPagination'
import { PurchaseService } from '../../services/PurchaseService'
import Purchase from '../../types/Purchase'
import PurchaseFilters from './components/PurchaseFilters'
import { useState, useEffect } from 'react'
import { useProductStore } from '../../stores/useProductStore'
import { useSupplierStore } from '../../stores/useSupplierStore'

const purchaseService = new PurchaseService()

function PurchasePage() {
    const date = new Date()
    const [filters, setFilters] = useState({
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
    })
    const {
        data: purchases,
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
    } = useServerPagination<Purchase>({
        fetchFunction: purchaseService.getAllPaginatedWithDetails.bind(purchaseService),
        fetchWithFilters: purchaseService.getAllPaginatedFiltered.bind(purchaseService),
        filters: filters,
        initialPage: 1,
        initialLimit: 10,
    })

    const products = useProductStore(state => state.products)
    const suppliers = useSupplierStore(state => state.suppliers)
    const fetchProducts = useProductStore(state => state.fetchProducts)
    const fetchSuppliers = useSupplierStore(state => state.fetchSuppliers)

    useEffect(() => {
        fetchProducts()
        fetchSuppliers()
    }, [fetchProducts, fetchSuppliers])

    const handlePurchaseCreated = (newPurchase: Purchase) => {
        addItem(newPurchase)
    }

    return (
        <section className="space-y-6">
            <PurchasesHeader onPurchaseCreated={handlePurchaseCreated} />
            <div className='bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-6 justify-between items-center'>
                <PurchaseFilters
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
                        className='px-4 py-2 rounded-2xl w-full md:w-fit text-white transition-colors bg-primary hover:bg-primary-hover'>
                        🔍 Buscar Detallado
                    </button>
                    <button
                        onClick={() => {
                            setActiveFilters(false)
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
                            goToPage(1)
                        }}
                        className='px-4 py-2 rounded-2xl w-full md:w-fit text-white bg-primary hover:bg-primary-hover transition-colors'>
                        🧹 Limpiar Filtros
                    </button>
                </div>
            </div>
            <PurchasesTable
                purchases={purchases}
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

export default PurchasePage
