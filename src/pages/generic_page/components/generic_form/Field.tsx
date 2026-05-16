import { Eye, EyeOff } from 'lucide-react'
import { GenericField } from '../../../../types/GenericConfig'

interface FieldProps<T> {
  field: GenericField<T>
  value: unknown
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  error?: string
  showPassword?: boolean
  onTogglePassword?: () => void
}

export default function Field<T>({ field, value, onChange, onBlur, error, showPassword, onTogglePassword }: FieldProps<T>) {
  const fieldName = field.name as string
  const rawValue = value ?? field.defaultValue ?? ''
  const displayValue = String(rawValue)

  const commonClasses = `w-full px-4 py-2 border rounded-lg bg-(--color-bg-surface) text-(--color-text-primary) focus:outline-none focus:ring-2 focus:ring-[var(--view-accent,var(--color-focus-ring))] ${error ? 'border-danger-500' : 'border-(--color-border)'
    } ${field.disabled ? 'bg-(--color-bg-subtle) cursor-not-allowed' : ''} ${field.className || ''}`

  switch (field.type) {
    case 'textarea':
      return (
        <textarea
          id={fieldName}
          name={fieldName}
          value={displayValue}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={field.placeholder}
          required={field.required}
          disabled={field.disabled}
          readOnly={field.readOnly}
          className={`${commonClasses} min-h-25 resize-y`}
          rows={4}
        />
      )

    case 'select':
      return (
        <select
          id={fieldName}
          name={fieldName}
          value={displayValue}
          onChange={onChange}
          onBlur={onBlur}
          required={field.required}
          disabled={field.disabled}
          className={commonClasses}
        >
          <option value="">Seleccionar...</option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )

    case 'checkbox':
      return (
        <div className="flex items-center">
          <input
            type="checkbox"
            id={fieldName}
            name={fieldName}
            checked={!!rawValue}
            onChange={onChange}
            disabled={field.disabled}
            className="w-4 h-4 text-[var(--view-accent,var(--color-action-bg))] border-(--color-border) rounded focus:ring-[var(--view-accent,var(--color-focus-ring))]"
          />
          <label htmlFor={fieldName} className="ml-2 text-sm text-(--color-text-secondary)">
            {field.label}
          </label>
        </div>
      )

    case 'password':
      return (
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id={fieldName}
            name={fieldName}
            value={displayValue}
            onChange={onChange}
            placeholder={field.placeholder}
            required={field.required}
            disabled={field.disabled}
            readOnly={field.readOnly}
            className={commonClasses}
          />
          {field.showPasswordToggle && onTogglePassword && (
            <button
              type="button"
              id={`toggle-${fieldName}`}
              onClick={onTogglePassword}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              aria-pressed={showPassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-text-secondary) hover:text-(--color-text-primary) focus:outline-none focus:ring-2 focus:ring-[var(--view-accent,var(--color-focus-ring))] rounded"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      )

    default: // text, email, number, date
      return (
        <input
          type={field.type}
          id={fieldName}
          name={fieldName}
          value={displayValue}
          onChange={onChange}
          placeholder={field.placeholder}
          required={field.required}
          disabled={field.disabled}
          readOnly={field.readOnly}
          min={field.min}
          max={field.max}
          step={field.step}
          onBlur={onBlur}
          className={commonClasses}
        />
      )
  }
}
