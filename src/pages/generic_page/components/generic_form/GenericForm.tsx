import type { CSSProperties } from 'react'
import FormError from './FormError'
import FieldWrapper from './FieldWrapper'
import FormActions from './FormActions'
import { GenericField } from '../../../../types/GenericConfig'
import { useGenericForm } from '../../../../hooks/useGenericForm'

interface GenericFormProps<T> {
  fields: GenericField<T>[]
  initialData?: Partial<T>
  onSubmit: (data: Partial<T>) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
  cancelLabel?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function GenericForm<T extends Record<string, any>>({
  fields,
  initialData = {},
  onSubmit,
  onCancel,
  submitLabel = 'Guardar',
  cancelLabel = 'Cancelar'
}: GenericFormProps<T>) {
  const {
    formData,
    errors,
    loading,
    showPasswords,
    handleChange,
    handleBlur,
    handleSubmit,
    togglePasswordVisibility
  } = useGenericForm(fields, initialData, onSubmit)

  return (
    // Route the form's focus ring to the active view accent; every primitive
    // (Input, Textarea, PasswordInput, Button) reads --color-focus-ring, so the
    // accent flows in via cascade with no per-field branching.
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      style={{ '--color-focus-ring': 'var(--view-accent)' } as CSSProperties}
    >
      <FormError error={errors.general} />

      {fields.map((field) => (
        <FieldWrapper
          key={field.name as string}
          field={field}
          value={formData[field.name]}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors[field.name as string]}
          showPassword={showPasswords[field.name as string]}
          onTogglePassword={() => togglePasswordVisibility(field.name as string)}
        />
      ))}

      <FormActions
        loading={loading}
        submitLabel={submitLabel}
        cancelLabel={cancelLabel}
        onCancel={onCancel}
      />
    </form>
  )
}
