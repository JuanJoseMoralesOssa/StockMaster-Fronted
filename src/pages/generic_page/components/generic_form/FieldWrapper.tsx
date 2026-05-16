import { GenericField } from '../../../../types/GenericConfig'
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

  if (field.type === 'checkbox') {
    return (
      <div className="space-y-1">
        <Field
          field={field}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          error={error}
          showPassword={showPassword}
          onTogglePassword={onTogglePassword}
        />
        {error && (
          <p className="text-danger-500 text-sm flex items-center gap-1">⚠️ {error}</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <label htmlFor={fieldId} className="block text-sm font-medium text-(--color-text-secondary)">
        {field.label}
        {field.required && <span className="text-danger-500 ml-1">*</span>}
      </label>
      <Field
        field={field}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        error={error}
        showPassword={showPassword}
        onTogglePassword={onTogglePassword}
      />
      {error && (
        <p className="text-danger-500 text-sm flex items-center gap-1">⚠️ {error}</p>
      )}
    </div>
  )
}
