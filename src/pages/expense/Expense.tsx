import GenericPage from '../generic_page/GenericPage'
import { expensePageConfig } from '../../config/expensePageConfig'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DateRangeFilters, buildInitialDateRangeFilters } from '../../utils/date'

function ExpensePage() {
    const [searchParams] = useSearchParams()
    const personId = searchParams.get('personId') ?? ''
    const personName = searchParams.get('personName') ?? ''
    const hasPersonFilter = personId.trim() !== ''

    const pageConfig = useMemo(() => ({
        ...expensePageConfig,
        initialFilterState: {
            ...buildInitialDateRangeFilters(),
            personId,
            personName,
        } as DateRangeFilters,
        clearFilterState: buildInitialDateRangeFilters(),
        initialFiltersActive: hasPersonFilter,
    }), [hasPersonFilter, personId, personName])

    return <GenericPage config={pageConfig} key={personId ? `supplier-${personId}` : 'all-expenses'} />
}

export default ExpensePage
