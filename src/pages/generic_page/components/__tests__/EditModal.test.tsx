// @vitest-environment jsdom
/**
 * Pruebas de EditModal: apertura/cierre, submit del formulario genérico de
 * edición (con prepareDataForSubmit), cancelación sin guardar, variante
 * renderEditForm, trampa de foco heredada del Modal y textos en español.
 */
import type { ReactNode } from 'react'
import { render, screen, within, fireEvent, waitFor, act } from '@testing-library/react'
import EditModal from '../EditModal'
import type { GenericField } from '../../../../types/GenericConfig'

interface Item {
  id: number
  name: string
  balance: number
}

const item: Item = { id: 7, name: 'Alpha', balance: 42 }

const formFields: GenericField<Item>[] = [
  { name: 'name', label: 'Nombre', type: 'text', required: true },
  { name: 'balance', label: 'Balance', type: 'number' },
]

interface RenderOverrides {
  isOpen?: boolean
  selectedItem?: Item | null
  formFields?: GenericField<Item>[]
  onUpdate?: (id: number | string, data: Partial<Item>) => Promise<Item>
  prepareDataForSubmit?: (data: Partial<Item>, isEdit: boolean) => Promise<Partial<Item>>
  renderEditForm?: (
    item: Item,
    onSuccess: () => void,
    onItemUpdated: (item: Item) => void,
    onItemDeleted: (id: string | number) => void,
  ) => ReactNode
}

function renderModal(overrides: RenderOverrides = {}) {
  const onUpdate = overrides.onUpdate ?? vi.fn().mockResolvedValue({ ...item, name: 'Actualizado' })
  const onEditSuccess = vi.fn()
  const onEditDeleted = vi.fn()
  const onClose = vi.fn()

  render(
    <EditModal<Item>
      isOpen={overrides.isOpen ?? true}
      selectedItem={'selectedItem' in overrides ? overrides.selectedItem ?? null : item}
      entityName="Producto"
      formFields={'formFields' in overrides ? overrides.formFields : formFields}
      onUpdate={onUpdate}
      prepareDataForSubmit={overrides.prepareDataForSubmit}
      renderEditForm={overrides.renderEditForm}
      onEditSuccess={onEditSuccess}
      onEditDeleted={onEditDeleted}
      onClose={onClose}
    />,
  )

  return { onUpdate, onEditSuccess, onEditDeleted, onClose }
}

describe('EditModal', () => {
  it('renderiza el diálogo cuando está abierto, con textos en español', () => {
    renderModal()

    const dialog = screen.getByRole('dialog', { name: 'Editar Producto' })
    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByText('Actualiza la información del Producto')).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Actualizar' })).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Cerrar diálogo' })).toBeInTheDocument()
  })

  it('no renderiza nada cuando isOpen es false', () => {
    renderModal({ isOpen: false })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('no renderiza nada cuando no hay item seleccionado, aunque isOpen sea true', () => {
    renderModal({ selectedItem: null })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('pre-llena el formulario con los valores del item seleccionado', () => {
    renderModal()
    expect(screen.getByRole('textbox', { name: 'Nombre' })).toHaveValue('Alpha')
    expect(screen.getByRole('spinbutton', { name: 'Balance' })).toHaveValue(42)
  })

  it('excluye del formulario los campos marcados hideOnEdit', () => {
    renderModal({
      formFields: [
        { name: 'name', label: 'Nombre', type: 'text', required: true },
        { name: 'balance', label: 'Balance', type: 'number', hideOnEdit: true },
      ],
    })
    expect(screen.getByRole('textbox', { name: 'Nombre' })).toBeInTheDocument()
    expect(screen.queryByRole('spinbutton', { name: 'Balance' })).not.toBeInTheDocument()
  })

  it('al enviar, invoca onUpdate con el id del item y los datos editados, y luego onEditSuccess', async () => {
    const updated: Item = { ...item, name: 'Alpha renovado' }
    const onUpdate = vi.fn().mockResolvedValue(updated)
    const { onEditSuccess, onClose } = renderModal({ onUpdate })

    fireEvent.change(screen.getByRole('textbox', { name: 'Nombre' }), {
      target: { value: 'Alpha renovado' },
    })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }))
    })

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith(7, { name: 'Alpha renovado', balance: 42 }),
    )
    expect(onEditSuccess).toHaveBeenCalledWith(updated)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('aplica prepareDataForSubmit (modo edición) antes de invocar onUpdate', async () => {
    const prepareDataForSubmit = vi
      .fn()
      .mockImplementation(async (data: Partial<Item>) => ({ ...data, balance: 100 }))
    const { onUpdate } = renderModal({ prepareDataForSubmit })

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }))
    })

    await waitFor(() => expect(onUpdate).toHaveBeenCalled())
    expect(prepareDataForSubmit).toHaveBeenCalledWith({ name: 'Alpha', balance: 42 }, true)
    expect(onUpdate).toHaveBeenCalledWith(7, { name: 'Alpha', balance: 100 })
  })

  it('Cancelar invoca onClose sin guardar', () => {
    const { onUpdate, onEditSuccess, onClose } = renderModal()

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onClose).toHaveBeenCalled()
    expect(onUpdate).not.toHaveBeenCalled()
    expect(onEditSuccess).not.toHaveBeenCalled()
  })

  it('el botón de cerrar del modal invoca onClose sin guardar', () => {
    const { onUpdate, onClose } = renderModal()

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar diálogo' }))

    expect(onClose).toHaveBeenCalled()
    expect(onUpdate).not.toHaveBeenCalled()
  })

  it('la tecla Escape cierra el modal sin guardar', () => {
    const { onUpdate, onClose } = renderModal()

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).toHaveBeenCalled()
    expect(onUpdate).not.toHaveBeenCalled()
  })

  describe('trampa de foco (useFocusTrap vía Modal)', () => {
    it('al abrir, el foco inicial queda dentro del modal (botón de cerrar)', () => {
      renderModal()
      expect(screen.getByRole('button', { name: 'Cerrar diálogo' })).toHaveFocus()
    })

    it('Tab desde el último elemento enfocable vuelve al primero', () => {
      renderModal()

      // El botón de cerrar es el último enfocable del diálogo y recibe el foco inicial.
      expect(screen.getByRole('button', { name: 'Cerrar diálogo' })).toHaveFocus()

      fireEvent.keyDown(document, { key: 'Tab' })

      expect(screen.getByRole('textbox', { name: 'Nombre' })).toHaveFocus()
    })

    it('Shift+Tab desde el primer elemento enfocable salta al último', () => {
      renderModal()

      screen.getByRole('textbox', { name: 'Nombre' }).focus()
      fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })

      expect(screen.getByRole('button', { name: 'Cerrar diálogo' })).toHaveFocus()
    })
  })

  describe('variante renderEditForm', () => {
    it('renderiza el formulario personalizado con el item seleccionado', () => {
      renderModal({
        renderEditForm: (current) => <p>Editando {current.name}</p>,
      })
      expect(screen.getByText('Editando Alpha')).toBeInTheDocument()
    })

    it('onItemUpdated propaga el item a onEditSuccess y cierra el modal', () => {
      const updated: Item = { ...item, name: 'Custom' }
      const { onEditSuccess, onClose } = renderModal({
        renderEditForm: (_current, _onSuccess, onItemUpdated) => (
          <button onClick={() => onItemUpdated(updated)}>Guardar custom</button>
        ),
      })

      fireEvent.click(screen.getByRole('button', { name: 'Guardar custom' }))

      expect(onEditSuccess).toHaveBeenCalledWith(updated)
      expect(onClose).toHaveBeenCalled()
    })

    it('onItemDeleted propaga el id a onEditDeleted y cierra el modal', () => {
      const { onEditDeleted, onClose } = renderModal({
        renderEditForm: (current, _onSuccess, _onItemUpdated, onItemDeleted) => (
          <button onClick={() => onItemDeleted(current.id)}>Borrar custom</button>
        ),
      })

      fireEvent.click(screen.getByRole('button', { name: 'Borrar custom' }))

      expect(onEditDeleted).toHaveBeenCalledWith(7)
      expect(onClose).toHaveBeenCalled()
    })

    it('el onSuccess del formulario personalizado solo cierra, sin guardar', () => {
      const { onEditSuccess, onClose } = renderModal({
        renderEditForm: (_current, onSuccess) => (
          <button onClick={onSuccess}>Cerrar custom</button>
        ),
      })

      fireEvent.click(screen.getByRole('button', { name: 'Cerrar custom' }))

      expect(onClose).toHaveBeenCalled()
      expect(onEditSuccess).not.toHaveBeenCalled()
    })
  })

  it('muestra un aviso cuando no hay formulario configurado', () => {
    renderModal({ formFields: undefined })
    expect(screen.getByText('No hay formulario de edición configurado')).toBeInTheDocument()
  })
})
