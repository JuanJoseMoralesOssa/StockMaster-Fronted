import GenericPage from '../generic_page/GenericPage'
import type KardexEntity from '../../types/Kardex'
import { KardexFilters, kardexPageConfig, buildInitialKardexFilters } from '../../config/kardexPageConfig'
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

    // Fechas calculadas al montar (no al cargar el módulo) para que una pestaña
    // abierta varios días no arrastre un "mes actual" desactualizado.
    const pageConfig = useMemo(() => ({
        ...kardexPageConfig,
        initialFilterState: {
            ...buildInitialKardexFilters(),
            productId,
            productName,
        } as KardexFilters,
        clearFilterState: buildInitialKardexFilters(),
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
