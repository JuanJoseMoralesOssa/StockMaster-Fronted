import { useState, type CSSProperties } from 'react'
import { useForm, Controller, type RegisterOptions, type DefaultValues, type Path, type FieldValues } from 'react-hook-form'
import FormError from './FormError'
import FieldWrapper from './FieldWrapper'
import FormActions from './FormActions'
import { type GenericField } from '../../../../types/GenericConfig'
import { extractErrorInfo } from '../../../../utils/error'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// `T extends FieldValues` (react-hook-form's own `Record<string, any>` alias) is
// what `useForm`/`Controller`/`Path`/`RegisterOptions` require; reusing their
// exported alias avoids writing a literal `any` in this file while keeping the
// exact assignability react-hook-form already relies on.
function buildRules<T extends FieldValues>(
  field: GenericField<T>,
  getValues: () => Partial<T>,
): RegisterOptions<T, Path<T>> {
  const rules: RegisterOptions = {}
  const validators: Record<string, (value: unknown) => true | string> = {}

  if (field.required && field.type !== 'checkbox') {
    if (field.type === 'number') {
      // 0 is a valid numeric value, so we can't use RHF's built-in required
      // (which treats 0 as falsy). Use a custom validator instead.
      validators.required = (v) =>
        v === undefined || v === '' || v === null ? `${field.label} es requerido` : true
    } else {
      // Native required triggers on submit regardless of mode; custom validate
      // does not when the field is untouched in onBlur mode.
      rules.required = `${field.label} es requerido`
    }
  }

  if (field.type === 'email') {
    validators.email = (v) =>
      v && !EMAIL_REGEX.test(String(v)) ? 'Email inválido' : true
  }

  if (field.type === 'number') {
    if (field.min !== undefined) {
      const min = field.min
      validators.min = (v) =>
        v !== undefined && v !== '' && Number(v) < min
          ? `Debe ser mayor o igual a ${min}`
          : true
    }
    if (field.max !== undefined) {
      const max = field.max
      validators.max = (v) =>
        v !== undefined && v !== '' && Number(v) > max
          ? `Debe ser menor o igual a ${max}`
          : true
    }
  }

  if (field.validate) {
    validators.custom = (v) => field.validate!(v, getValues()) ?? true
  }

  if (Object.keys(validators).length > 0) {
    rules.validate = validators
  }

  // Cast is safe: we never set `deps`, the only field whose type differs
  // between the generic and non-generic RegisterOptions.
  return rules as RegisterOptions<T, Path<T>>
}

interface GenericFormProps<T> {
  fields: GenericField<T>[]
  initialData?: Partial<T>
  onSubmit: (data: Partial<T>) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
  cancelLabel?: string
}

// Same reasoning as `buildRules` above: `FieldValues` is react-hook-form's own
// constraint for `useForm<T>`, so this stays exactly as permissive as before
// without a local `any`.
export default function GenericForm<T extends FieldValues>({
  fields,
  initialData = {},
  onSubmit,
  onCancel,
  submitLabel = 'Guardar',
  cancelLabel = 'Cancelar',
}: GenericFormProps<T>) {
  const {
    control,
    handleSubmit,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<T>({
    defaultValues: initialData as DefaultValues<T>,
    mode: 'onBlur',
  })

  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})

  const onValid = async (data: T) => {
    try {
      await onSubmit(data as Partial<T>)
    } catch (error: unknown) {
      const { message } = extractErrorInfo(error)
      setError('root', { message: message ?? 'Error al procesar la solicitud' })
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onValid)}
      className="space-y-4"
      style={{ '--color-focus-ring': 'var(--view-accent)' } as CSSProperties}
    >
      <FormError error={errors.root?.message} />

      {/* Una columna en móvil/tablet (ya revisado); en desktop se reparte en dos
          para reducir el scroll vertical. El segundo eje solo se activa con 2+
          campos —así un formulario de un solo campo no queda a media columna—.
          textarea/checkbox y los campos con `fullWidth` ocupan la fila completa. */}
      <div className={`grid grid-cols-1 gap-4${fields.length > 1 ? ' lg:grid-cols-2' : ''}`}>
        {fields.map((field) => {
          const spanFull =
            field.fullWidth || field.type === 'textarea' || field.type === 'checkbox'
          return (
            <div key={field.name as string} className={spanFull ? 'lg:col-span-2' : undefined}>
              <Controller
                name={field.name as Path<T>}
                control={control}
                rules={buildRules(field, getValues)}
                render={({ field: rhf, fieldState }) => (
                  <FieldWrapper
                    field={field}
                    value={rhf.value ?? field.defaultValue ?? ''}
                    onChange={(e) => {
                      const { type, value } = e.target
                      if (type === 'checkbox') {
                        rhf.onChange((e.target as HTMLInputElement).checked)
                      } else if (type === 'number') {
                        rhf.onChange(value === '' ? '' : Number(value))
                      } else {
                        rhf.onChange(value)
                      }
                    }}
                    onBlur={rhf.onBlur}
                    error={fieldState.error?.message}
                    showPassword={showPasswords[field.name as string]}
                    onTogglePassword={() =>
                      setShowPasswords((p) => ({
                        ...p,
                        [field.name as string]: !p[field.name as string],
                      }))
                    }
                  />
                )}
              />
            </div>
          )
        })}
      </div>

      <FormActions
        loading={isSubmitting}
        submitLabel={submitLabel}
        cancelLabel={cancelLabel}
        onCancel={onCancel}
      />
    </form>
  )
}
