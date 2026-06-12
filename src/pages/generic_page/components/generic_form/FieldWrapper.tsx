import { GenericField } from '../../../../types/GenericConfig'
import { Label } from '../../../../components/ui'
import Field from './Field'

interface FieldWrapperProps<T> {
  field: GenericField<T>
  value: unknown
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  error?: string
  showPassword?: boolean
  onTogglePassword?: () => void
}

export default function FieldWrapper<T>({ field, value, onChange, onBlur, error, showPassword, onTogglePassword }: FieldWrapperProps<T>) {
  const fieldId = typeof field.name === 'string' ? field.name : String(field.name)
  const errorId = `${fieldId}-error`
  const describedById = error ? errorId : undefined

  const errorMessage = error && (
    <p id={errorId} role="alert" className="mt-1 text-xs text-danger-700">
      {error}
    </p>
  )

  // Checkbox renders its own inline label inside Field; only attach the error.
  if (field.type === 'checkbox') {
    return (
      <div className="space-y-1">
        <Field
          field={field}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          error={error}
          hasError={Boolean(error)}
          describedById={describedById}
          showPassword={showPassword}
          onTogglePassword={onTogglePassword}
        />
        {errorMessage}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <Label htmlFor={fieldId} required={field.required}>
        {field.label}
      </Label>
      <Field
        field={field}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        error={error}
        hasError={Boolean(error)}
        describedById={describedById}
        showPassword={showPassword}
        onTogglePassword={onTogglePassword}
      />
      {errorMessage}
    </div>
  )
}
