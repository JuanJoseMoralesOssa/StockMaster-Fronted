// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import Pagination from './Pagination'

function mockMatchMedia(width: number) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: query.includes('min-width: 1024px') ? width >= 1024 : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  })
}

describe('Pagination', () => {
  afterEach(() => {
    cleanup()
  })

  it('mantiene la vista compacta en tablet desde 790px hasta justo antes de 1024px', () => {
    for (const width of [790, 800, 866]) {
      mockMatchMedia(width)

      render(
        <Pagination
          currentPage={3}
          totalPages={8}
          totalItems={80}
          itemsPerPage={10}
          onPageChange={vi.fn()}
          onItemsPerPageChange={vi.fn()}
        />,
      )

      expect(screen.getByRole('button', { name: 'Anterior' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Siguiente' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: '1' })).not.toBeInTheDocument()

      cleanup()
    }
  })

  it('muestra la navegación detallada desde desktop', () => {
    mockMatchMedia(1024)

    render(
      <Pagination
        currentPage={3}
        totalPages={8}
        totalItems={80}
        itemsPerPage={10}
        onPageChange={vi.fn()}
        onItemsPerPageChange={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Anterior' })).not.toBeInTheDocument()
  })
})
