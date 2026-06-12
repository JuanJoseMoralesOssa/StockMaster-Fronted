import { useServerPagination } from '../../hooks/useServerPagination'
import { useAutoRefresh } from '../../hooks/useAutoRefresh'
import { GenericPageConfig } from '../../types/GenericConfig'
import { useState, useMemo, useCallback } from 'react'
import type { GenericService } from '../../types/GenericTypes'

import { PageContextProvider } from './components/page/PageContext'
import PageHeader from './components/page/PageHeader'
import PageFilters from './components/page/PageFilters'
import PageTable from './components/page/PageTable'
import PageDetailsModal from './components/page/PageDetailsModal'

interface GenericPageProps<T, TFilter extends object = object, CreateInput = Partial<T>, UpdateInput = Partial<T>> {
  config: GenericPageConfig<T, TFilter, CreateInput, UpdateInput>
  children?: React.ReactNode
  serviceHooksFactory?: (service: GenericService<T, TFilter, CreateInput, UpdateInput>) => Partial<GenericService<T, TFilter, CreateInput, UpdateInput>>
}

function GenericPage<T extends object, TFilter extends object = object, CreateInput = Partial<T>, UpdateInput = Partial<T>>({ config, serviceHooksFactory, children }: GenericPageProps<T, TFilter, CreateInput, UpdateInput>) {
  const initialFilters = (config.initialFilterState || {} as TFilter)
  const clearFilterState = (config.clearFilterState || initialFilters)
  const [filters, setFilters] = useState<TFilter>(initialFilters)
  const [appliedFilters, setAppliedFilters] = useState<TFilter>(initialFilters)
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<T | null>(null)
  const [filterRefreshToken, setFilterRefreshToken] = useState(0)

  const mergedService = useMemo<GenericPageConfig<T, TFilter, CreateInput, UpdateInput>['service']>(() => {
    const base = config.service
    const overrides = serviceHooksFactory ? serviceHooksFactory(base) : {}
    return {
      getAllPaginated: overrides.getAllPaginated ?? base.getAllPaginated.bind(base),
      create: overrides.create ?? base.create.bind(base),
      update: overrides.update ?? base.update.bind(base),
      updatePartial: overrides.updatePartial ?? base.updatePartial.bind(base),
      delete: overrides.delete ?? base.delete.bind(base),
      getAllPaginatedFiltered: overrides.getAllPaginatedFiltered ?? base.getAllPaginatedFiltered?.bind(base),
    }
  }, [config.service, serviceHooksFactory])

  const fetchPaginated = useCallback(
    (page: number, limit: number) => mergedService.getAllPaginated(page, limit),
    [mergedService]
  )

  const fetchWithFiltersFn = useCallback(
    (f: TFilter, page?: number, limit?: number) => {
      if (mergedService.getAllPaginatedFiltered) {
        return mergedService.getAllPaginatedFiltered(f, page, limit)
      }
      // Fallback to unfiltered paginated fetch — ensure numeric args
      const safePage = page ?? 1
      const safeLimit = limit ?? 10
      return mergedService.getAllPaginated(safePage, safeLimit)
    },
    [mergedService]
  )

  const {
    data,
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
    setActiveFilters,
    addItem,
    updateItem,
    removeItem,
    retry,
  } = useServerPagination<T, TFilter>({
    fetchFunction: fetchPaginated,
    fetchWithFilters: mergedService.getAllPaginatedFiltered ? fetchWithFiltersFn : undefined,
    filters: appliedFilters,
    initialActiveFilters: Boolean(config.initialFiltersActive),
    initialPage: 1,
    initialLimit: 10,
    refreshToken: filterRefreshToken,
  })

  // Keep the list current: re-fetch the viewed page every 5 minutes (respecting
  // active filters/page). Data stays visible during the background refresh.
  useAutoRefresh(refresh)

  const runSubmissionPipeline = async <Output, Input extends Partial<T>>(
    formData: Input,
    isEdit: boolean,
    submitFn: (data: CreateInput | UpdateInput | Partial<UpdateInput>) => Promise<Output>,
  ) => {
    const preparedData = config.prepareDataForSubmit
      ? await config.prepareDataForSubmit(formData, isEdit)
      : formData

    if (config.validateData) {
      const validationError = await config.validateData(preparedData)
      if (validationError) {
        throw new Error(validationError)
      }
    }

    return submitFn(preparedData as CreateInput | UpdateInput | Partial<UpdateInput>)
  }

  const handleCreate = async (formData: Partial<T>) => {
    return runSubmissionPipeline(formData, false, dataToSubmit => mergedService.create(dataToSubmit as CreateInput))
  }

  const handleUpdate = async (id: number | string, formData: Partial<T>) => {
    return runSubmissionPipeline(formData, true, dataToSubmit => {
      return config.updatePartial
        ? mergedService.updatePartial(id, dataToSubmit as Partial<UpdateInput>)
        : mergedService.update(id, dataToSubmit as UpdateInput)
    })
  }

  const handleDelete = async (id: number | string) => {
    return mergedService.delete(id)
  }

  const applyFilters = () => {
    setAppliedFilters(filters)
    setActiveFilters(true)
    setFilterRefreshToken(prev => prev + 1)
    goToPage(1)
  }

  const clearFilters = () => {
    setFilters(clearFilterState)
    setAppliedFilters(clearFilterState)
    setActiveFilters(false)
    setFilterRefreshToken(prev => prev + 1)
    goToPage(1)
  }

  const contextValue = {
    data: data as T[],
    loading,
    error,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    filters,
    setFilters,
    goToPage,
    setItemsPerPage,
    refresh,
    refreshWithFilters,
    setActiveFilters,
    applyFilters,
    clearFilters,
    addItem,
    updateItem,
    removeItem,
    retry,
    handleCreate,
    handleUpdate,
    handleDelete,
    selectedItemForDetail,
    setSelectedItemForDetail
  }

  return (
    <PageContextProvider value={contextValue}>
      <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-4 py-5 sm:px-6 md:gap-6 md:px-8 md:py-6">
        {children || (
          <>
            <PageHeader config={config} />
            <PageFilters config={config} />
            <PageTable config={config} />
            <PageDetailsModal config={config} />
          </>
        )}
      </section>
    </PageContextProvider>
  )
}

// Export sub-components to allow manual composition
GenericPage.Header = PageHeader
GenericPage.Filters = PageFilters
GenericPage.Table = PageTable
GenericPage.DetailsModal = PageDetailsModal

export default GenericPage
