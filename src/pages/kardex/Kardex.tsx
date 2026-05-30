import GenericPage from '../generic_page/GenericPage'
import type KardexEntity from '../../types/Kardex'
import { KardexFilters, kardexPageConfig } from '../../config/kardexPageConfig'
import { kardexService } from '../../services/KardexService'
import { useEntityCrud } from '../../hooks/useEntityCrud'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

function KardexPage() {
    const [searchParams] = useSearchParams()
    const productId = searchParams.get('productId') ?? ''
    const productName = searchParams.get('productName') ?? ''
    const hasProductFilter = productId.trim() !== ''

    const createServiceHooks = useEntityCrud(kardexService, 'Registro de kardex')

    const pageConfig = useMemo(() => ({
        ...kardexPageConfig,
        initialFilterState: {
            ...kardexPageConfig.initialFilterState,
            productId,
            productName,
        } as KardexFilters,
        initialFiltersActive: hasProductFilter,
    }), [hasProductFilter, productId, productName])

    return (
        <GenericPage<KardexEntity, KardexFilters>
            key={productId ? `product-${productId}` : 'all-kardex'}
            config={pageConfig}
            serviceHooksFactory={createServiceHooks}
        >
            <GenericPage.Header config={pageConfig} />
            <GenericPage.Filters config={pageConfig} />
            <GenericPage.Table config={pageConfig} />
            <GenericPage.DetailsModal config={pageConfig} />
        </GenericPage>
    )
}

export default KardexPage
