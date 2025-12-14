import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { GenericField } from '../../../types/GenericConfig'

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
  const [formData, setFormData] = useState<Partial<T>>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target

    let finalValue: string | number | boolean = value

    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked
    } else if (type === 'number') {
      finalValue = value === '' ? '' : Number(value)
    }

    setFormData({ ...formData, [name]: finalValue })

    // Limpiar error del campo al cambiar
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    fields.forEach(field => {
      const value = formData[field.name]

      // Validar campos requeridos
      if (field.required && !value && value !== 0 && value !== false) {
        newErrors[field.name as string] = `${field.label} es requerido`
        return
      }

      // Validar email
      if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(String(value))) {
          newErrors[field.name as string] = 'Email inválido'
          return
        }
      }

      // Validar número min/max
      if (field.type === 'number' && value !== undefined && value !== '') {
        if (field.min !== undefined && Number(value) < field.min) {
          newErrors[field.name as string] = `Debe ser mayor o igual a ${field.min}`
          return
        }
        if (field.max !== undefined && Number(value) > field.max) {
          newErrors[field.name as string] = `Debe ser menor o igual a ${field.max}`
          return
        }
      }

      // Validación personalizada
      if (field.validate) {
        const error = field.validate(value, formData)
        if (error) {
          newErrors[field.name as string] = error
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      await onSubmit(formData)
    } catch (error: unknown) {
      // Manejar errores del servidor
      const err = error as { response?: { data?: { message?: string } } }
      if (err.response?.data?.message) {
        setErrors({ general: err.response.data.message })
      } else {
        setErrors({ general: 'Error al procesar la solicitud' })
      }
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = (fieldName: string) => {
    setShowPasswords({
      ...showPasswords,
      [fieldName]: !showPasswords[fieldName]
    })
  }

  const renderField = (field: GenericField<T>) => {
    const fieldName = field.name as string
    const rawValue = formData[field.name] ?? field.defaultValue ?? ''
    const value = String(rawValue)

    const commonClasses = `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors[fieldName] ? 'border-red-500' : 'border-gray-300'
      } ${field.disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${field.className || ''}`

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            name={fieldName}
            value={value}
            onChange={handleChange}
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
            name={fieldName}
            value={value}
            onChange={handleChange}
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
              name={fieldName}
              checked={!!rawValue}
              onChange={handleChange}
              disabled={field.disabled}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor={fieldName} className="ml-2 text-sm text-gray-700">
              {field.label}
            </label>
          </div>
        )

      case 'password':
        return (
          <div className="relative">
            <input
              type={showPasswords[fieldName] ? 'text' : 'password'}
              name={fieldName}
              value={value}
              onChange={handleChange}
              placeholder={field.placeholder}
              required={field.required}
              disabled={field.disabled}
              readOnly={field.readOnly}
              className={commonClasses}
            />
            {field.showPasswordToggle && (
              <button
                type="button"
                onClick={() => togglePasswordVisibility(fieldName)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords[fieldName] ? (
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
            name={fieldName}
            value={value}
            onChange={handleChange}
            placeholder={field.placeholder}
            required={field.required}
            disabled={field.disabled}
            readOnly={field.readOnly}
            min={field.min}
            max={field.max}
            step={field.step}
            className={commonClasses}
          />
        )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.general && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{errors.general}</p>
        </div>
      )}

      {fields.map((field) => {
        if (field.type === 'checkbox') {
          return (
            <div key={field.name as string} className="space-y-1">
              {renderField(field)}
              {errors[field.name as string] && (
                <p className="text-red-500 text-sm">{errors[field.name as string]}</p>
              )}
            </div>
          )
        }

        return (
          <div key={field.name as string} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderField(field)}
            {errors[field.name as string] && (
              <p className="text-red-500 text-sm">{errors[field.name as string]}</p>
            )}
          </div>
        )
      })}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Procesando...' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {cancelLabel}
          </button>
        )}
      </div>
    </form>
  )
}
