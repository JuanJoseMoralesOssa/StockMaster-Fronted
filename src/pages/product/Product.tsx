import { ProductService } from '../../services/ProductService'
import { useServerPagination } from '../../hooks/useServerPagination'
import ProductsHeader from './components/ProductsHeader'
import ProductsTable from './components/ProductsTable'

const productService = new ProductService()

function Product() {
    const {
        data: products,
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
    } = useServerPagination({
        fetchFunction: productService.getAllPaginated.bind(productService),
        initialPage: 1,
        initialLimit: 10,
    })

    return (
        <section>
            <ProductsHeader onProductCreated={addItem} />
            <ProductsTable
                products={products}
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

export default Product
