import GenericPage from '../generic_page/GenericPage'
import Product from '../../types/Product'
import { productService } from '../../services/ProductService'
import { useEntityCrud } from '../../hooks/useEntityCrud'
import { ProductFilters, productPageConfig } from '../../config/productPageConfig'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

function ProductPage() {
    const navigate = useNavigate()
    const createServiceHooks = useEntityCrud(productService, 'Producto')

    const pageConfig = useMemo(() => ({
        ...productPageConfig,
        actions: {
            ...productPageConfig.actions,
            customActions: productPageConfig.actions?.customActions?.map((action) => (
                action.label === 'Ver Kardex'
                    ? {
                        ...action,
                        onClick: (product: Product) => {
                            if (!product.id) return
                            const params = new URLSearchParams({
                                productId: product.id.toString(),
                                productName: product.name,
                            })
                            navigate(`/kardex?${params.toString()}`)
                        },
                    }
                    : action
            )),
        },
    }), [navigate])

    return (
        <GenericPage<Product, ProductFilters> config={pageConfig} serviceHooksFactory={createServiceHooks}>
            <GenericPage.Header config={pageConfig} />
            <GenericPage.Filters config={pageConfig} />
            <GenericPage.Table config={pageConfig} />
            <GenericPage.DetailsModal config={pageConfig} />
        </GenericPage>
    )
}

export default ProductPage
