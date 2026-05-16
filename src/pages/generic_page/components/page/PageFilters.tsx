import { useGenericPageContext } from './PageContext'
import { GenericPageConfig } from '../../../../types/GenericConfig'

interface PageFiltersProps<T, TFilter = object, CreateInput = Partial<T>, UpdateInput = Partial<T>> {
  config: GenericPageConfig<T, TFilter, CreateInput, UpdateInput>
}

export default function PageFilters<T extends object, TFilter = object, CreateInput = Partial<T>, UpdateInput = Partial<T>>({
  config
}: PageFiltersProps<T, TFilter, CreateInput, UpdateInput>) {
  const { filters, setFilters, applyFilters, clearFilters } = useGenericPageContext<T, TFilter>()

  if (!config.renderCustomFilters) return null

  return (
    <section className="rounded-lg border border-(--color-border) bg-(--color-bg-surface) p-4 shadow-xs md:p-5">
      {config.renderCustomFilters({
        filters,
        setFilters,
        onSearch: applyFilters,
        onClear: clearFilters,
      })}
    </section>
  )
}
