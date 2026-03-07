import { useState } from 'react'
import { GenericField } from '../types/GenericConfig'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useGenericForm<T extends Record<string, any>>(
  fields: GenericField<T>[],
  initialData: Partial<T> = {},
  onSubmit: (data: Partial<T>) => Promise<void>
) {
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

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name } = e.target
    const field = fields.find(f => (f.name as string) === name)
    if (!field) return

    const value = formData[field.name]
    const newErrors = { ...errors }

    if (field.required && !value && value !== 0 && value !== false) {
      newErrors[name] = `${field.label} es requerido`
    } else if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(String(value))) {
        newErrors[name] = 'Email inválido'
      } else {
        delete newErrors[name]
      }
    } else if (field.type === 'number' && value !== undefined && value !== '') {
      if (field.min !== undefined && Number(value) < field.min) {
        newErrors[name] = `Debe ser mayor o igual a ${field.min}`
      } else if (field.max !== undefined && Number(value) > field.max) {
        newErrors[name] = `Debe ser menor o igual a ${field.max}`
      } else if (field.validate) {
        const error = field.validate(value, formData)
        if (error) newErrors[name] = error
        else delete newErrors[name]
      } else {
        delete newErrors[name]
      }
    } else if (field.validate) {
      const error = field.validate(value, formData)
      if (error) newErrors[name] = error
      else delete newErrors[name]
    } else {
      delete newErrors[name]
    }

    setErrors(newErrors)
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

  return {
    formData,
    errors,
    loading,
    showPasswords,
    handleChange,
    handleBlur,
    handleSubmit,
    togglePasswordVisibility
  }
}
