import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange?: (itemsPerPage: number) => void
  showItemsPerPageSelector?: boolean
  itemsPerPageOptions?: number[]
  className?: string
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPageSelector = true,
  itemsPerPageOptions = [5, 10, 20, 50],
  className = '',
}: Readonly<PaginationProps>) {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  const visiblePages = totalPages > 1 ? getVisiblePages() : [1]
  const controlClass = "relative inline-flex h-10 min-w-10 items-center justify-center border border-(--color-border) bg-(--color-bg-surface) px-3 text-sm font-medium text-(--color-text-secondary) transition-colors hover:bg-(--color-bg-subtle) disabled:cursor-not-allowed disabled:opacity-50"

  return (
    <div className={`flex items-center justify-between border-t border-(--color-border) bg-(--color-bg-surface) px-4 py-3 sm:px-5 ${className}`}>
      <div className="flex w-full flex-col gap-2 sm:hidden">
        <p className="text-center text-xs text-(--color-text-secondary)">
          Página <span className="font-medium">{currentPage}</span> de{' '}
          <span className="font-medium">{totalPages}</span>
          {' · '}
          <span className="font-medium">{startItem}</span>–
          <span className="font-medium">{endItem}</span> de{' '}
          <span className="font-medium">{totalItems}</span>
        </p>
        <div className="flex justify-between gap-3">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex min-h-11 flex-1 items-center justify-center rounded-md border border-(--color-border) bg-(--color-bg-surface) px-4 text-sm font-medium text-(--color-text-secondary) hover:bg-(--color-bg-subtle) disabled:cursor-not-allowed disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative inline-flex min-h-11 flex-1 items-center justify-center rounded-md border border-(--color-border) bg-(--color-bg-surface) px-4 text-sm font-medium text-(--color-text-secondary) hover:bg-(--color-bg-subtle) disabled:cursor-not-allowed disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
        {showItemsPerPageSelector && onItemsPerPageChange && (
          <div className="flex items-center justify-center gap-2">
            <label htmlFor="itemsPerPageMobile" className="text-xs text-(--color-text-secondary)">
              Por página:
            </label>
            <select
              id="itemsPerPageMobile"
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="rounded-md border border-(--color-border) bg-(--color-bg-surface) px-2 py-1.5 text-sm pointer-coarse:text-[1rem] min-h-11 text-(--color-text-primary) focus:outline-none focus:ring-2 focus:ring-(--view-accent,var(--color-focus-ring))"
            >
              {itemsPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center space-x-4">
          <p className="text-sm text-(--color-text-secondary)">
            Mostrando <span className="font-medium">{startItem}</span> a{' '}
            <span className="font-medium">{endItem}</span> de{' '}
            <span className="font-medium">{totalItems}</span> resultados
          </p>
          {showItemsPerPageSelector && onItemsPerPageChange && (
            <div className="flex items-center space-x-2">
              <label htmlFor="itemsPerPage" className="text-sm text-(--color-text-secondary)">
                Items por página:
              </label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                className="h-8 rounded-md border border-(--color-border) bg-(--color-bg-surface) px-2 text-sm pointer-coarse:text-[1rem] text-(--color-text-primary) focus:outline-none focus:ring-2 focus:ring-(--view-accent,var(--color-focus-ring))"
              >
                {itemsPerPageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div>
          <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-xs" aria-label="Pagination">
            {/* First page button */}
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className={`${controlClass} rounded-l-md px-2`}
            >
              <ChevronsLeft className="h-4 w-4" />
              <span className="sr-only">Primera página</span>
            </button>

            {/* Previous page button */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`${controlClass} px-2`}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Página anterior</span>
            </button>

            {/* Page numbers */}
            {visiblePages.map((page, index) => {
              if (page === '...') {
                return (
                  <span
                    key={`dots-${index === 1 ? 'start' : 'end'}`}
                    className={controlClass}
                  >
                    ...
                  </span>
                )
              }

              const pageNumber = page as number
              const isCurrentPage = pageNumber === currentPage

              return (
                <button
                  key={pageNumber}
                  onClick={() => onPageChange(pageNumber)}
                  className={`${controlClass} ${isCurrentPage
                    ? 'z-10 border-(--view-accent,var(--color-action-bg)) bg-(--view-accent-soft,var(--color-bg-subtle)) text-(--view-accent-text,var(--color-text-link))'
                    : ''
                    }`}
                >
                  {pageNumber}
                </button>
              )
            })}

            {/* Next page button */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`${controlClass} px-2`}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Página siguiente</span>
            </button>

            {/* Last page button */}
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className={`${controlClass} rounded-r-md px-2`}
            >
              <ChevronsRight className="h-4 w-4" />
              <span className="sr-only">Última página</span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  )
}
