import { GenericField } from '../../../../types/GenericConfig'
import { toDateInputValue } from '../../../../utils/date'
import { cn } from '../../../../lib/utils'
import { Input, Textarea, PasswordInput } from '../../../../components/ui'

interface FieldProps<T> {
  field: GenericField<T>
  value: unknown
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  error?: string
  hasError?: boolean
  describedById?: string
  showPassword?: boolean
  onTogglePassword?: () => void
}

export default function Field<T>({ field, value, onChange, onBlur, error, hasError, describedById, showPassword, onTogglePassword }: FieldProps<T>) {
  const fieldName = field.name as string
  const rawValue = value ?? field.defaultValue ?? ''
  const displayValue = field.type === 'date'
    ? toDateInputValue(String(rawValue))
    : String(rawValue)

  const invalid = hasError ?? Boolean(error)
  const a11y = {
    'aria-invalid': invalid || undefined,
    'aria-describedby': describedById,
  }

  // Native select still needs the shared field styling; primitives (Input,
  // Textarea, PasswordInput) own their own. The accent ring arrives via the
  // form container overriding --color-focus-ring.
  const selectClasses = cn(
    'w-full h-input px-3 rounded-md border bg-(--color-bg-surface) text-(--color-text-primary) text-sm pointer-coarse:text-[1rem]',
    'placeholder:text-(--color-text-muted) transition-colors',
    'focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus-ring)',
    'disabled:bg-(--color-bg-subtle) disabled:cursor-not-allowed disabled:opacity-60',
    invalid
      ? 'border-danger-500'
      : 'border-(--color-border) hover:border-(--color-border-strong)',
    field.className
  )

  switch (field.type) {
    case 'textarea':
      return (
        <Textarea
          id={fieldName}
          name={fieldName}
          value={displayValue}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={field.placeholder}
          required={field.required}
          disabled={field.disabled}
          readOnly={field.readOnly}
          rows={4}
          hasError={invalid}
          aria-describedby={describedById}
          className={cn('min-h-24', field.className)}
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
          className={selectClasses}
          {...a11y}
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
            className="w-4 h-4 text-(--view-accent,var(--color-action-bg)) border-(--color-border) rounded focus:ring-(--color-focus-ring)"
            {...a11y}
          />
          <label htmlFor={fieldName} className="ml-2 text-sm text-(--color-text-secondary)">
            {field.label}
          </label>
        </div>
      )

    case 'password':
      return (
        <PasswordInput
          id={fieldName}
          name={fieldName}
          value={displayValue}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={field.placeholder}
          required={field.required}
          disabled={field.disabled}
          readOnly={field.readOnly}
          hasError={invalid}
          showToggle={Boolean(field.showPasswordToggle && onTogglePassword)}
          visible={showPassword}
          onToggleVisibility={onTogglePassword}
          {...a11y}
        />
      )

    default: // text, email, number, date
      return (
        <Input
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
          hasError={invalid}
          aria-describedby={describedById}
          className={field.className}
        />
      )
  }
}
