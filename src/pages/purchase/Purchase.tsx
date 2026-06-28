import GenericPage from '../generic_page/GenericPage'
import { purchasePageConfig } from '../../config/purchasePageConfig'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DateRangeFilters, buildInitialDateRangeFilters } from '../../utils/date'

function PurchasePage() {
    const [searchParams] = useSearchParams()
    const personId = searchParams.get('personId') ?? ''
    const personName = searchParams.get('personName') ?? ''
    const productId = searchParams.get('productId') ?? ''
    const productName = searchParams.get('productName') ?? ''
    const hasFilter = personId.trim() !== '' || productId.trim() !== ''

    const pageConfig = useMemo(() => ({
        ...purchasePageConfig,
        initialFilterState: {
            ...buildInitialDateRangeFilters(),
            personId,
            personName,
            productId,
            productName,
        } as DateRangeFilters,
        clearFilterState: buildInitialDateRangeFilters(),
        initialFiltersActive: hasFilter,
    }), [hasFilter, personId, personName, productId, productName])

    return <GenericPage config={pageConfig} key={`purchases-${personId || 'all'}-${productId || 'all'}`} />
}

export default PurchasePage
