import GenericPage from '../generic_page/GenericPage'
import { paymentPageConfig } from '../../config/paymentPageConfig'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DateRangeFilters, buildInitialDateRangeFilters } from '../../utils/date'

function PaymentPage() {
    const [searchParams] = useSearchParams()
    const personId = searchParams.get('personId') ?? ''
    const personName = searchParams.get('personName') ?? ''
    const productId = searchParams.get('productId') ?? ''
    const productName = searchParams.get('productName') ?? ''
    const hasFilter = personId.trim() !== '' || productId.trim() !== ''

    const pageConfig = useMemo(() => ({
        ...paymentPageConfig,
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

    return <GenericPage config={pageConfig} key={`payments-${personId || 'all'}-${productId || 'all'}`} />
}

export default PaymentPage
