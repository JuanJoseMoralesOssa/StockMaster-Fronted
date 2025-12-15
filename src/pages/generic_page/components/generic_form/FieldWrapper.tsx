import { GenericField } from '../../../../types/GenericConfig'
import Field from './Field'

interface FieldWrapperProps<T> {
  field: GenericField<T>
  value: unknown
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  error?: string
  showPassword?: boolean
  onTogglePassword?: () => void
}

export default function FieldWrapper<T>({ field, value, onChange, error, showPassword, onTogglePassword }: FieldWrapperProps<T>) {

  if (field.type === 'checkbox') {
    return (
      <div className="space-y-1">
        <Field
          field={field}
          value={value}
          onChange={onChange}
          error={error}
          showPassword={showPassword}
          onTogglePassword={onTogglePassword}
        />
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Field
        field={field}
        value={value}
        onChange={onChange}
        error={error}
        showPassword={showPassword}
        onTogglePassword={onTogglePassword}
      />
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  )
}
