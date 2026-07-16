// @vitest-environment jsdom
/**
 * Smoke test de GenericPage: monta la página completa con una config mínima
 * falsa (forma tomada de productPageConfig) y verifica el ciclo básico:
 * carga inicial desde el service paginado, render de header/tabla y el flujo
 * de creación de un item de punta a punta (modal → GenericForm → service.create).
 */
import { render, screen, within, fireEvent, act } from '@testing-library/react'
import GenericPage from '../GenericPage'
import type { GenericPageConfig } from '../../../types/GenericConfig'
import type { PaginatedResponse } from '../../../types/PaginatedResponse'

vi.mock('../../../services/ToastService', () => ({
  ToastService: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    confirmDelete: vi.fn(),
  },
}))

interface Gadget {
  id: number
  name: string
}

function paginated(data: Gadget[]): PaginatedResponse<Gadget> {
  return {
    count: data.length,
    data,
    page: 1,
    limit: 20,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  }
}

/** Igual al patrón de Pagination.test.tsx: fija el breakpoint lg (desktop). */
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

function buildConfig(): GenericPageConfig<Gadget> {
  return {
    entityName: 'Gadget',
    entityNamePlural: 'Gadgets',
    idField: 'id',
    columns: [{ key: 'name', label: 'Nombre' }],
    formFields: [{ name: 'name', label: 'Nombre', type: 'text', required: true }],
    service: {
      getAllPaginated: vi.fn().mockResolvedValue(
        paginated([
          { id: 1, name: 'Alpha' },
          { id: 2, name: 'Beta' },
        ]),
      ),
      create: vi.fn().mockImplementation(async (data: Partial<Gadget>) => ({ id: 3, ...data }) as Gadget),
      update: vi.fn(),
      updatePartial: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined),
    },
  }
}

describe('GenericPage (smoke)', () => {
  beforeEach(() => mockMatchMedia(1280))

  it('carga la primera página desde el service y renderiza header y tabla', async () => {
    const config = buildConfig()
    render(<GenericPage<Gadget> config={config} />)

    expect(screen.getByRole('heading', { name: 'Gadgets' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Crear' })).toBeInTheDocument()

    expect(await screen.findByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Nombre' })).toBeInTheDocument()
    expect(config.service.getAllPaginated).toHaveBeenCalledWith(1, 20)
  })

  it('crea un item desde el modal y lo agrega a la tabla', async () => {
    const config = buildConfig()
    render(<GenericPage<Gadget> config={config} />)
    await screen.findByText('Alpha')

    fireEvent.click(screen.getByRole('button', { name: 'Crear' }))
    const dialog = screen.getByRole('dialog', { name: 'Crear Gadget' })

    fireEvent.change(within(dialog).getByRole('textbox', { name: 'Nombre' }), {
      target: { value: 'Gamma' },
    })
    await act(async () => {
      fireEvent.click(within(dialog).getByRole('button', { name: 'Crear' }))
    })

    expect(config.service.create).toHaveBeenCalledWith({ name: 'Gamma' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText('Gamma')).toBeInTheDocument()
  })
})
