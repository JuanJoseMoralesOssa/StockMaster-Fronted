import { useGenericPageContext } from './PageContext'
import { GenericPageConfig } from '../../../../types/GenericConfig'

interface PageFiltersProps<T, TFilter = object, CreateInput = Partial<T>, UpdateInput = Partial<T>> {
  config: GenericPageConfig<T, TFilter, CreateInput, UpdateInput>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function PageFilters<T extends object, TFilter = object, CreateInput = Partial<T>, UpdateInput = Partial<T>>({
  config
}: PageFiltersProps<T, TFilter, CreateInput, UpdateInput>) {
  const { filters, setFilters, applyFilters, clearFilters } = useGenericPageContext<T, TFilter>()

  if (!config.renderCustomFilters) return null

  return (
    <div className="mb-4">
      {config.renderCustomFilters({
        filters,
        setFilters,
        onSearch: applyFilters,
        onClear: clearFilters,
      })}
    </div>
  )
}
