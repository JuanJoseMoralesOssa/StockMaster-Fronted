// @vitest-environment jsdom
/**
 * Pruebas de GenericTable y sus piezas: genericTableUtils (getCellValue),
 * GenericTableHeader, GenericHeader, useTableActions y GenericTable en sí
 * (que compone GenericTableBody/GenericTableCards según el viewport).
 *
 * ToastService se mockea porque las confirmaciones de borrado y los toasts
 * usan SweetAlert2, que no resuelve sincrónicamente en jsdom.
 */
import type { ReactNode } from 'react'
import { render, screen, within, fireEvent, act, renderHook } from '@testing-library/react'
import GenericTable from '../GenericTable'
import GenericTableHeader from '../GenericTableHeader'
import GenericHeader from '../GenericHeader'
import { getCellValue } from '../genericTableUtils'
import { useTableActions } from '../useTableActions'
import { PageContextProvider } from '../../page/PageContext'
import { ToastService } from '../../../../../services/ToastService'
import type { GenericColumn, GenericActions, GenericField } from '../../../../../types/GenericConfig'
import type { PageContextValue } from '../../../../../types/GenericTypes'

vi.mock('../../../../../services/ToastService', () => ({
  ToastService: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    confirmDelete: vi.fn(),
  },
}))

// ── fixtures ─────────────────────────────────────────────────────────────

interface Item {
  id: number
  name: string
  balance: number
  active: boolean
  note?: string
}

const sampleItem: Item = { id: 1, name: 'Alpha', balance: 10, active: true }

const sampleData: Item[] = [
  sampleItem,
  { id: 2, name: 'Beta', balance: 20, active: false },
]

const columns: GenericColumn<Item>[] = [
  { key: 'name', label: 'Nombre' },
  {
    key: 'balance',
    label: 'Balance',
    align: 'right',
    render: (item) => `$${item.balance.toFixed(2)}`,
  },
  { key: 'active', label: 'Activo' },
]

// ── helpers ──────────────────────────────────────────────────────────────

/** Igual al patrón usado en Pagination.test.tsx para simular el breakpoint lg. */
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

function buildContextValue(overrides: Partial<PageContextValue<Item>> = {}): PageContextValue<Item> {
  return {
    data: sampleData,
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalItems: sampleData.length,
    itemsPerPage: 10,
    filters: {},
    setFilters: vi.fn(),
    goToPage: vi.fn(),
    setItemsPerPage: vi.fn(),
    refresh: vi.fn(),
    refreshWithFilters: vi.fn().mockResolvedValue(null),
    setActiveFilters: vi.fn(),
    applyFilters: vi.fn(),
    clearFilters: vi.fn(),
    addItem: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
    retry: vi.fn().mockResolvedValue(null),
    handleCreate: vi.fn(),
    handleUpdate: vi.fn(),
    handleDelete: vi.fn().mockResolvedValue(undefined),
    selectedItemForDetail: null,
    setSelectedItemForDetail: vi.fn(),
    ...overrides,
  }
}

interface TableTestProps {
  columns?: GenericColumn<Item>[]
  rowClassName?: (item: Item) => string
  actions?: GenericActions<Item>
  idField?: keyof Item
  entityName?: string
  formFields?: GenericField<Item>[]
  prepareDataForSubmit?: (data: Partial<Item>, isEdit: boolean) => Promise<Partial<Item>>
  modalClassName?: string
  expandableConfig?: {
    renderExpandedContent: (item: Item) => ReactNode
    expandedTitle?: (item: Item) => string
  }
  renderEditForm?: (
    item: Item,
    onSuccess: () => void,
    onItemUpdated: (item: Item) => void,
    onItemDeleted: (id: string | number) => void,
  ) => ReactNode
  fetchForEdit?: (id: string | number) => Promise<Item>
}

function renderTable(props: TableTestProps = {}, contextOverrides: Partial<PageContextValue<Item>> = {}) {
  const contextValue = buildContextValue(contextOverrides)
  render(
    <PageContextProvider value={contextValue}>
      <GenericTable<Item>
        columns={columns}
        idField="id"
        entityName="Producto"
        {...props}
      />
    </PageContextProvider>,
  )
  return contextValue
}

// ── genericTableUtils ────────────────────────────────────────────────────

describe('getCellValue (genericTableUtils)', () => {
  it('usa el render personalizado de la columna cuando está definido', () => {
    const column: GenericColumn<Item> = { key: 'balance', label: 'Balance', render: () => 'custom' }
    expect(getCellValue(sampleItem, column)).toBe('custom')
  })

  it('formatea booleanos como Sí/No', () => {
    const column: GenericColumn<Item> = { key: 'active', label: 'Activo' }
    expect(getCellValue({ ...sampleItem, active: true }, column)).toBe('Sí')
    expect(getCellValue({ ...sampleItem, active: false }, column)).toBe('No')
  })

  it('devuelve un guion para valores null o undefined', () => {
    const column: GenericColumn<Item> = { key: 'note', label: 'Nota' }
    expect(getCellValue({ ...sampleItem, note: undefined }, column)).toBe('-')
  })

  it('convierte otros valores a string', () => {
    const column: GenericColumn<Item> = { key: 'name', label: 'Nombre' }
    expect(getCellValue(sampleItem, column)).toBe('Alpha')
  })
})

// ── GenericTableHeader ───────────────────────────────────────────────────

describe('GenericTableHeader', () => {
  it('renderiza una columna por cada entrada de configuración', () => {
    render(
      <table>
        <GenericTableHeader<Item> columns={columns} showActions={false} />
      </table>,
    )
    expect(screen.getByRole('columnheader', { name: 'Nombre' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Balance' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Activo' })).toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: 'Acciones' })).not.toBeInTheDocument()
  })

  it('agrega la columna de Acciones cuando showActions es true', () => {
    render(
      <table>
        <GenericTableHeader<Item> columns={columns} showActions />
      </table>,
    )
    expect(screen.getByRole('columnheader', { name: 'Acciones' })).toBeInTheDocument()
  })

  it('agrega una celda accesible extra cuando hay filas expandibles', () => {
    render(
      <table>
        <GenericTableHeader<Item> columns={columns} showActions={false} hasExpandable />
      </table>,
    )
    expect(screen.getByText('Ver detalles')).toBeInTheDocument()
  })
})

// ── GenericHeader ────────────────────────────────────────────────────────

describe('GenericHeader', () => {
  it('abre el modal de creación, invoca renderCreateForm y cierra al terminar', () => {
    const onItemCreated = vi.fn()
    render(
      <GenericHeader<Item>
        title="Productos"
        onItemCreated={onItemCreated}
        renderCreateForm={(onSuccess, onCreated) => (
          <button
            onClick={() => {
              onCreated(sampleItem)
              onSuccess()
            }}
          >
            Guardar nuevo
          </button>
        )}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Productos' })).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Nuevo' }))
    expect(screen.getByRole('dialog', { name: 'Crear Nuevo' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Guardar nuevo' }))
    expect(onItemCreated).toHaveBeenCalledWith(sampleItem)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('usa los textos personalizados de botón y modal cuando se proveen', () => {
    render(
      <GenericHeader<Item>
        title="Productos"
        createButtonText="Agregar producto"
        modalTitle="Alta de producto"
        onItemCreated={vi.fn()}
        renderCreateForm={() => <p>Formulario</p>}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Agregar producto' }))
    expect(screen.getByRole('dialog', { name: 'Alta de producto' })).toBeInTheDocument()
  })

  it('renderCustomButton reemplaza el botón por defecto pero sigue abriendo el modal', () => {
    render(
      <GenericHeader<Item>
        title="Productos"
        onItemCreated={vi.fn()}
        renderCreateForm={() => <p>Formulario</p>}
        renderCustomButton={(onClick) => <button onClick={onClick}>Botón custom</button>}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Nuevo' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Botón custom' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('renderiza extraActions junto al botón de crear', () => {
    render(
      <GenericHeader<Item>
        title="Productos"
        onItemCreated={vi.fn()}
        renderCreateForm={() => <p>Formulario</p>}
        extraActions={<button>Escanear</button>}
      />,
    )
    expect(screen.getByRole('button', { name: 'Escanear' })).toBeInTheDocument()
  })
})

// ── useTableActions ──────────────────────────────────────────────────────

describe('useTableActions', () => {
  function setupHook(overrides: {
    onDelete?: (id: number | string, item?: Item) => Promise<void>
    updateItem?: (item: Item, idField?: keyof Item) => void
    removeItem?: (id: string | number, idField?: keyof Item) => void
    fetchForEdit?: (id: string | number) => Promise<Item>
    onDeleteSuccess?: () => void
  } = {}) {
    const onDelete = overrides.onDelete ?? vi.fn().mockResolvedValue(undefined)
    const updateItem = overrides.updateItem ?? vi.fn()
    const removeItem = overrides.removeItem ?? vi.fn()
    const onDeleteSuccess = overrides.onDeleteSuccess ?? vi.fn()

    const { result } = renderHook(() =>
      useTableActions<Item>(
        'Producto',
        onDelete,
        updateItem,
        removeItem,
        overrides.fetchForEdit,
        'id',
        onDeleteSuccess,
      ),
    )
    return { result, onDelete, updateItem, removeItem, onDeleteSuccess }
  }

  it('no elimina si el usuario cancela la confirmación', async () => {
    vi.mocked(ToastService.confirmDelete).mockResolvedValue(false)
    const { result, onDelete, removeItem } = setupHook()

    await act(async () => {
      await result.current.handleDelete(sampleItem, 'id')
    })

    expect(onDelete).not.toHaveBeenCalled()
    expect(removeItem).not.toHaveBeenCalled()
    expect(result.current.deletingItemId).toBeNull()
  })

  it('elimina, notifica el éxito y limpia deletingItemId cuando se confirma', async () => {
    vi.mocked(ToastService.confirmDelete).mockResolvedValue(true)
    const { result, onDelete, removeItem, onDeleteSuccess } = setupHook()

    await act(async () => {
      await result.current.handleDelete(sampleItem, 'id')
    })

    expect(onDelete).toHaveBeenCalledWith(1, sampleItem)
    expect(removeItem).toHaveBeenCalledWith(1, 'id')
    expect(onDeleteSuccess).toHaveBeenCalled()
    expect(ToastService.success).toHaveBeenCalledWith('Producto eliminado exitosamente', 'Eliminación exitosa')
    expect(result.current.deletingItemId).toBeNull()
  })

  it('muestra un toast de error y no elimina localmente cuando el borrado falla', async () => {
    vi.mocked(ToastService.confirmDelete).mockResolvedValue(true)
    const onDelete = vi.fn().mockRejectedValue(new Error('Boom'))
    const { result, removeItem } = setupHook({ onDelete })

    await act(async () => {
      await result.current.handleDelete(sampleItem, 'id')
    })

    expect(removeItem).not.toHaveBeenCalled()
    expect(ToastService.error).toHaveBeenCalledWith('Boom', 'Error')
    expect(result.current.deletingItemId).toBeNull()
  })

  it('sin fetchForEdit: abre el modal directamente con el item recibido', async () => {
    const { result } = setupHook()

    await act(async () => {
      await result.current.handleEdit(sampleItem)
    })

    expect(result.current.isEditModalOpen).toBe(true)
    expect(result.current.selectedItem).toEqual(sampleItem)
  })

  it('con fetchForEdit: carga el item completo antes de abrir el modal', async () => {
    const fullItem: Item = { ...sampleItem, note: 'detalle completo' }
    const fetchForEdit = vi.fn().mockResolvedValue(fullItem)
    const { result } = setupHook({ fetchForEdit })

    await act(async () => {
      await result.current.handleEdit(sampleItem)
    })

    expect(fetchForEdit).toHaveBeenCalledWith(1)
    expect(result.current.selectedItem).toEqual(fullItem)
    expect(result.current.isEditModalOpen).toBe(true)
    expect(result.current.loadingEditId).toBeNull()
  })

  it('con fetchForEdit: si falla, muestra un toast de error y no abre el modal', async () => {
    const fetchForEdit = vi.fn().mockRejectedValue(new Error('No encontrado'))
    const { result } = setupHook({ fetchForEdit })

    await act(async () => {
      await result.current.handleEdit(sampleItem)
    })

    expect(ToastService.error).toHaveBeenCalledWith('No encontrado', 'Error')
    expect(result.current.isEditModalOpen).toBe(false)
    expect(result.current.loadingEditId).toBeNull()
  })

  it('handleEditSuccess actualiza el item, cierra el modal y notifica el éxito', async () => {
    const { result, updateItem } = setupHook()

    await act(async () => {
      await result.current.handleEdit(sampleItem)
    })

    const updated: Item = { ...sampleItem, name: 'Actualizado' }
    act(() => {
      result.current.handleEditSuccess(updated, 'id')
    })

    expect(updateItem).toHaveBeenCalledWith(updated, 'id')
    expect(result.current.isEditModalOpen).toBe(false)
    expect(result.current.selectedItem).toBeNull()
    expect(ToastService.success).toHaveBeenCalledWith('Producto actualizado exitosamente', 'Actualización exitosa')
  })

  it('closeEditModal cierra el modal sin guardar cambios', async () => {
    const { result, updateItem } = setupHook()

    await act(async () => {
      await result.current.handleEdit(sampleItem)
    })
    act(() => {
      result.current.closeEditModal()
    })

    expect(result.current.isEditModalOpen).toBe(false)
    expect(result.current.selectedItem).toBeNull()
    expect(updateItem).not.toHaveBeenCalled()
  })
})

// ── GenericTable ─────────────────────────────────────────────────────────

describe('GenericTable', () => {
  describe('en desktop (>= 1024px)', () => {
    beforeEach(() => mockMatchMedia(1280))

    it('renderiza columnas y filas a partir de las props, con formateo por defecto y personalizado', () => {
      renderTable()

      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: 'Nombre' })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: 'Balance' })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: 'Activo' })).toBeInTheDocument()

      const rows = screen.getAllByRole('row')
      const alphaRow = rows.find((row) => within(row).queryByText('Alpha'))
      const betaRow = rows.find((row) => within(row).queryByText('Beta'))

      expect(alphaRow).toBeDefined()
      expect(within(alphaRow as HTMLElement).getByText('$10.00')).toBeInTheDocument()
      expect(within(alphaRow as HTMLElement).getByText('Sí')).toBeInTheDocument()

      expect(betaRow).toBeDefined()
      expect(within(betaRow as HTMLElement).getByText('$20.00')).toBeInTheDocument()
      expect(within(betaRow as HTMLElement).getByText('No')).toBeInTheDocument()
    })

    it('muestra un guion para valores null/undefined usando el formateo por defecto', () => {
      const dataWithMissingNote: Item[] = [{ ...sampleItem, note: undefined }]
      renderTable(
        { columns: [...columns, { key: 'note', label: 'Nota' }] },
        { data: dataWithMissingNote, totalItems: 1 },
      )
      expect(screen.getByText('-')).toBeInTheDocument()
    })

    it('no muestra la columna de Acciones ni botones cuando canEdit/canDelete son false y no hay customActions', () => {
      renderTable({ actions: { canEdit: false, canDelete: false } })
      expect(screen.queryByRole('columnheader', { name: 'Acciones' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Eliminar' })).not.toBeInTheDocument()
    })

    it('el botón Editar abre el modal con el item correcto y guardar invoca handleUpdate/updateItem', async () => {
      const formFields: GenericField<Item>[] = [{ name: 'name', label: 'Nombre', type: 'text', required: true }]
      const updated: Item = { ...sampleItem, name: 'Alpha renovado' }
      const contextValue = renderTable(
        { formFields },
        { handleUpdate: vi.fn().mockResolvedValue(updated) },
      )

      const rows = screen.getAllByRole('row')
      const alphaRow = rows.find((row) => within(row).queryByText('Alpha')) as HTMLElement
      fireEvent.click(within(alphaRow).getByRole('button', { name: 'Editar' }))

      const dialog = await screen.findByRole('dialog', { name: 'Editar Producto' })
      const nameInput = within(dialog).getByRole('textbox', { name: 'Nombre' })
      expect(nameInput).toHaveValue('Alpha')

      fireEvent.change(nameInput, { target: { value: 'Alpha renovado' } })
      await act(async () => {
        fireEvent.click(within(dialog).getByRole('button', { name: 'Actualizar' }))
      })

      expect(contextValue.handleUpdate).toHaveBeenCalledWith(1, { name: 'Alpha renovado' })
      expect(contextValue.updateItem).toHaveBeenCalledWith(updated, 'id')
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('el botón Eliminar no elimina si se cancela la confirmación', async () => {
      vi.mocked(ToastService.confirmDelete).mockResolvedValue(false)
      const contextValue = renderTable()

      const rows = screen.getAllByRole('row')
      const betaRow = rows.find((row) => within(row).queryByText('Beta')) as HTMLElement
      await act(async () => {
        fireEvent.click(within(betaRow).getByRole('button', { name: 'Eliminar' }))
      })

      // useToast reenvía un tercer argumento confirmText (undefined si no se pasa).
      expect(ToastService.confirmDelete).toHaveBeenCalledWith(
        '¿Estás seguro de que deseas eliminar este Producto?',
        'Eliminar Producto',
        undefined,
      )
      expect(contextValue.handleDelete).not.toHaveBeenCalled()
      expect(contextValue.removeItem).not.toHaveBeenCalled()
      expect(contextValue.refresh).not.toHaveBeenCalled()
    })

    it('el botón Eliminar confirma, elimina el item y refresca la lista', async () => {
      vi.mocked(ToastService.confirmDelete).mockResolvedValue(true)
      const contextValue = renderTable()

      const rows = screen.getAllByRole('row')
      const betaRow = rows.find((row) => within(row).queryByText('Beta')) as HTMLElement
      await act(async () => {
        fireEvent.click(within(betaRow).getByRole('button', { name: 'Eliminar' }))
      })

      expect(contextValue.handleDelete).toHaveBeenCalledWith(2, sampleData[1])
      expect(contextValue.removeItem).toHaveBeenCalledWith(2, 'id')
      expect(contextValue.refresh).toHaveBeenCalled()
      expect(ToastService.success).toHaveBeenCalledWith('Producto eliminado exitosamente', 'Eliminación exitosa')
    })

    it('no refresca tras eliminar el último item visible de una página > 1', async () => {
      vi.mocked(ToastService.confirmDelete).mockResolvedValue(true)
      const singleItemData = [sampleItem]
      const contextValue = renderTable({}, { data: singleItemData, currentPage: 2, totalItems: 1 })

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))
      })

      expect(contextValue.removeItem).toHaveBeenCalledWith(1, 'id')
      expect(contextValue.refresh).not.toHaveBeenCalled()
    })

    it('las acciones personalizadas del dropdown invocan el callback con el item correcto', () => {
      const onClick = vi.fn()
      renderTable({
        actions: {
          canEdit: false,
          canDelete: false,
          customActions: [{ icon: <span aria-hidden="true">*</span>, label: 'Ver Kardex', onClick }],
        },
      })

      const rows = screen.getAllByRole('row')
      const betaRow = rows.find((row) => within(row).queryByText('Beta')) as HTMLElement
      fireEvent.click(within(betaRow).getByRole('button', { name: 'Más opciones' }))

      const menu = screen.getByRole('menu')
      fireEvent.click(within(menu).getByRole('menuitem', { name: 'Ver Kardex' }))

      expect(onClick).toHaveBeenCalledWith(sampleData[1])
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })

    it('fila expandible: alterna el contenido expandido y aria-expanded al hacer clic', () => {
      renderTable({
        expandableConfig: {
          renderExpandedContent: (item) => <span>Contenido expandido de {item.name}</span>,
          expandedTitle: (item) => `Detalle de ${item.name}`,
        },
      })

      const toggle = screen.getAllByRole('button', { name: 'Ver detalles' })[0]
      expect(toggle).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByText('Contenido expandido de Alpha')).not.toBeInTheDocument()

      fireEvent.click(toggle)

      expect(screen.getByText('Contenido expandido de Alpha')).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 4, name: 'Detalle de Alpha' })).toBeInTheDocument()
      const hideButton = screen.getByRole('button', { name: 'Ocultar detalles' })
      expect(hideButton).toHaveAttribute('aria-expanded', 'true')

      fireEvent.click(hideButton)
      expect(screen.queryByText('Contenido expandido de Alpha')).not.toBeInTheDocument()
    })

    it('estado de error: muestra el mensaje y Reintentar invoca retry', () => {
      const contextValue = renderTable({}, { error: 'Boom' })

      const alert = screen.getByRole('alert')
      expect(within(alert).getByText('No se pudo cargar la información')).toBeInTheDocument()
      expect(within(alert).getByText('Boom')).toBeInTheDocument()

      fireEvent.click(within(alert).getByRole('button', { name: 'Reintentar' }))
      expect(contextValue.retry).toHaveBeenCalled()
    })

    it('estado vacío: muestra el mensaje de "sin datos" usando entityName en minúsculas', () => {
      renderTable({}, { data: [], totalItems: 0 })
      expect(screen.getByText('No hay producto para mostrar')).toBeInTheDocument()
      expect(screen.getByText('Cuando se creen registros aparecerán aquí.')).toBeInTheDocument()
      expect(screen.queryByRole('table')).not.toBeInTheDocument()
    })

    it('estado de carga sin datos: muestra el esqueleto en vez de la tabla o el estado vacío', () => {
      const { container } = render(
        <PageContextProvider value={buildContextValue({ data: [], loading: true, totalItems: 0 })}>
          <GenericTable<Item> columns={columns} idField="id" entityName="Producto" />
        </PageContextProvider>,
      )

      expect(screen.queryByRole('table')).not.toBeInTheDocument()
      expect(screen.queryByText('No hay producto para mostrar')).not.toBeInTheDocument()
      expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(0)
    })

    it('loading true con datos existentes: mantiene la tabla visible (no muestra el esqueleto)', () => {
      renderTable({}, { loading: true })
      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getByText('Alpha')).toBeInTheDocument()
    })
  })

  describe('en mobile (< 1024px): variante de cards', () => {
    beforeEach(() => mockMatchMedia(500))

    it('renderiza cards en vez de tabla, con la primera columna visible como título', () => {
      renderTable()

      expect(screen.queryByRole('table')).not.toBeInTheDocument()
      const cards = screen.getAllByRole('listitem')
      expect(cards).toHaveLength(2)
      expect(within(cards[0]).getByText('Alpha')).toBeInTheDocument()
      expect(within(cards[0]).getByText('Balance')).toBeInTheDocument()
      expect(within(cards[0]).getByText('$10.00')).toBeInTheDocument()
    })

    it('excluye columnas marcadas hideOnMobile de las cards', () => {
      const columnsWithHidden: GenericColumn<Item>[] = [
        ...columns,
        { key: 'note', label: 'Nota', hideOnMobile: true },
      ]
      renderTable(
        { columns: columnsWithHidden },
        { data: [{ ...sampleItem, note: 'secreto-movil' }], totalItems: 1 },
      )
      expect(screen.queryByText('secreto-movil')).not.toBeInTheDocument()
      expect(screen.queryByText('Nota')).not.toBeInTheDocument()
    })

    it('el botón Eliminar en la card funciona igual que en la tabla', async () => {
      vi.mocked(ToastService.confirmDelete).mockResolvedValue(true)
      const contextValue = renderTable()

      const cards = screen.getAllByRole('listitem')
      const betaCard = cards.find((card) => within(card).queryByText('Beta')) as HTMLElement
      await act(async () => {
        fireEvent.click(within(betaCard).getByRole('button', { name: 'Eliminar' }))
      })

      expect(contextValue.handleDelete).toHaveBeenCalledWith(2, sampleData[1])
      expect(contextValue.removeItem).toHaveBeenCalledWith(2, 'id')
    })
  })
})
