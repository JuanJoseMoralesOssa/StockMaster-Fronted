import PurchasesHeader from './components/PurchasesHeader'
import PurchasesTable from './components/PurchasesTable'
import { useServerPagination } from '../../hooks/useServerPagination'
import { PurchaseService } from '../../services/PurchaseService'
import Purchase from '../../types/Purchase'

const purchaseService = new PurchaseService()

function PurchasePage() {
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
        addItem,
        updateItem,
        removeItem
    } = useServerPagination<Purchase>({
        fetchFunction: purchaseService.getAllPaginatedWithDetails.bind(purchaseService),
        initialPage: 1,
        initialLimit: 10,
    })

    const handlePurchaseCreated = (newPurchase: Purchase) => {
        addItem(newPurchase)
    }

    return (
        <section className="space-y-6">
            <PurchasesHeader onPurchaseCreated={handlePurchaseCreated} />
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
