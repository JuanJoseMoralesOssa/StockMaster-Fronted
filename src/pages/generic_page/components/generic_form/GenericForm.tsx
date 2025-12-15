
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
    handleSubmit,
    togglePasswordVisibility
  } = useGenericForm(fields, initialData, onSubmit)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormError error={errors.general} />

      {fields.map((field) => (
        <FieldWrapper
          key={field.name as string}
          field={field}
          value={formData[field.name]}
          onChange={handleChange}
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
