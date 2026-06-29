import { Search, X } from 'lucide-react'
import { Button, Input } from '@/components/ui'

interface NameSearchFilterProps {
  /** id del input (para el htmlFor del label). */
  id: string
  /** Texto del label / aria-label. */
  label: string
  /** Placeholder del input. */
  placeholder: string
  value: string
  onChange: (value: string) => void
  onSearch: () => void
  onClear: () => void
  loading: boolean
}

/**
 * Filtro de búsqueda por nombre, compartido por las páginas de catálogo simples
 * (Productos, Proveedores) para que se vean y comporten igual: input que ocupa el
 * ancho disponible + botones Buscar/Limpiar consistentes y responsive.
 */
export default function NameSearchFilter({
  id,
  label,
  placeholder,
  value,
  onChange,
  onSearch,
  onClear,
  loading,
}: Readonly<NameSearchFilterProps>) {
  return (
    <form
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
      aria-busy={loading}
      onSubmit={(event) => {
        event.preventDefault()
        onSearch()
      }}
    >
      {/* Anuncia el estado de la búsqueda a lectores de pantalla (el spinner del
          botón es solo visual). */}
      <span className="sr-only" role="status" aria-live="polite">
        {loading ? 'Buscando…' : ''}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <label htmlFor={id} className="text-sm font-medium text-(--color-text-secondary)">
          {label}
        </label>
        <Input
          id={id}
          type="search"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
      <div className="flex w-full flex-col gap-2 sm:w-fit sm:flex-row sm:justify-end">
        <Button
          type="submit"
          variant="secondary"
          size="sm"
          className="w-full sm:w-fit"
          loading={loading}
          leftIcon={<Search className="h-4 w-4" />}
        >
          Buscar
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="w-full sm:w-fit"
          disabled={loading}
          leftIcon={<X className="h-4 w-4" />}
          onClick={onClear}
        >
          Limpiar
        </Button>
      </div>
    </form>
  )
}
