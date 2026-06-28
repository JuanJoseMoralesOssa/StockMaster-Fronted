// @vitest-environment jsdom
/**
 * Pruebas de GenericForm: validación de campos, errores de servidor y
 * comportamiento en blur/submit usando react-hook-form + Controller.
 */
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import GenericForm from '../GenericForm'
import type { GenericField } from '../../../../../types/GenericConfig'

// ── helpers ────────────────────────────────────────────────────────────────

type SimpleForm = { name: string; email?: string; age?: number; agree?: boolean }

function textField(overrides: Partial<GenericField<SimpleForm>> = {}): GenericField<SimpleForm> {
  return { name: 'name', label: 'Nombre', type: 'text', required: true, ...overrides }
}

function renderForm(
  fields: GenericField<SimpleForm>[],
  onSubmit: (data: Partial<SimpleForm>) => Promise<void> = () => Promise.resolve(),
  initialData: Partial<SimpleForm> = {},
) {
  return render(
    <GenericForm<SimpleForm>
      fields={fields}
      initialData={initialData}
      onSubmit={onSubmit}
    />,
  )
}

async function submitForm() {
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))
  })
}

// ── tests ──────────────────────────────────────────────────────────────────

describe('GenericForm', () => {
  it('bloquea el submit cuando un campo requerido está vacío', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    renderForm([textField()], onSubmit)

    await submitForm()

    await waitFor(() =>
      expect(screen.getByText('Nombre es requerido')).toBeInTheDocument(),
    )
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('acepta 0 como valor válido en un campo numérico requerido', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    renderForm(
      [{ name: 'age', label: 'Edad', type: 'number', required: true }],
      onSubmit,
      { age: 0 },
    )

    await submitForm()

    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(screen.queryByText('Edad es requerido')).not.toBeInTheDocument()
  })

  it('valida formato de email inválido en blur', async () => {
    renderForm([{ name: 'email', label: 'Email', type: 'email', required: true }])

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'no-es-email' } })
    fireEvent.blur(input)

    await waitFor(() =>
      expect(screen.getByText('Email inválido')).toBeInTheDocument(),
    )
  })

  it('acepta un email válido sin mostrar error', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    renderForm([{ name: 'email', label: 'Email', type: 'email', required: true }], onSubmit)

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'user@example.com' } })
    fireEvent.blur(input)

    await submitForm()
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(screen.queryByText('Email inválido')).not.toBeInTheDocument()
  })

  it('valida min/max en campo numérico en blur', async () => {
    renderForm([{ name: 'age', label: 'Edad', type: 'number', min: 18, max: 99 }])

    const input = screen.getByRole('spinbutton')

    fireEvent.change(input, { target: { value: '10' } })
    fireEvent.blur(input)
    await waitFor(() =>
      expect(screen.getByText('Debe ser mayor o igual a 18')).toBeInTheDocument(),
    )

    fireEvent.change(input, { target: { value: '200' } })
    fireEvent.blur(input)
    await waitFor(() =>
      expect(screen.getByText('Debe ser menor o igual a 99')).toBeInTheDocument(),
    )
  })

  it('ejecuta la función validate personalizada en blur', async () => {
    const validate = vi.fn().mockReturnValue('Valor no permitido')
    renderForm([textField({ required: false, validate })])

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'algo' } })
    fireEvent.blur(input)

    await waitFor(() =>
      expect(screen.getByText('Valor no permitido')).toBeInTheDocument(),
    )
    expect(validate).toHaveBeenCalledWith('algo', expect.any(Object))
  })

  it('muestra el error devuelto por onSubmit (error de servidor)', async () => {
    const onSubmit = vi.fn().mockRejectedValue({
      response: { data: { message: 'El nombre ya existe' } },
    })
    renderForm([textField({ required: false })], onSubmit)

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } })
    await submitForm()

    await waitFor(() =>
      expect(screen.getByText('El nombre ya existe')).toBeInTheDocument(),
    )
  })

  it('usa error.message cuando onSubmit lanza sin response.data.message', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Network error'))
    renderForm([textField({ required: false })], onSubmit)

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } })
    await submitForm()

    await waitFor(() =>
      expect(screen.getByText('Network error')).toBeInTheDocument(),
    )
  })

  it('valida en blur usando las mismas reglas que en submit', async () => {
    renderForm([textField()])

    const input = screen.getByRole('textbox')
    fireEvent.blur(input)

    await waitFor(() =>
      expect(screen.getByText('Nombre es requerido')).toBeInTheDocument(),
    )
  })
})
