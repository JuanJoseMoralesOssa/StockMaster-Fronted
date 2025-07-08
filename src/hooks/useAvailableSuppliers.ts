import { useState, useEffect } from 'react'
import Person from '../types/Person'
import { personService } from '../services/PersonService'

// Caché global a nivel de módulo (persiste entre renders)
let supplierCache: Person[] | null = null
let isLoading = false
let loadError: Error | null = null
let listeners: (() => void)[] = []

// Función para notificar a todos los suscriptores
const notifyListeners = () => {
  listeners.forEach((listener) => listener())
}

export const useAvailableSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Person[]>(supplierCache || [])
  const [loading, setLoading] = useState(isLoading || !supplierCache)
  const [error, setError] = useState<Error | null>(loadError)

  useEffect(() => {
    // Si ya tenemos datos en caché, los usamos inmediatamente
    if (supplierCache) {
      setSuppliers(supplierCache)
      setLoading(false)
      return
    }

    // Si ya hay una carga en progreso, esperamos
    if (isLoading) {
      // Nos suscribimos a actualizaciones
      const updateState = () => {
        setSuppliers(supplierCache || [])
        setLoading(isLoading)
        setError(loadError)
      }

      listeners.push(updateState)

      // Limpieza al desmontar
      return () => {
        listeners = listeners.filter((fn) => fn !== updateState)
      }
    }

    // Si no hay caché ni carga en progreso, iniciamos la carga
    const fetchSuppliers = async () => {
      if (isLoading || supplierCache) return

      try {
        isLoading = true
        setLoading(true)

        // Simulación o llamada real a API
        // await new Promise((resolve) => setTimeout(resolve, 1000))
        // const proveedoresDisponibles = [
        //     { id: 1, name: 'Proveedor X' },
        //     { id: 2, name: 'Proveedor Y' },
        //     { id: 3, name: 'Proveedor Z' },
        // ]

        const proveedoresDisponibles = await personService.getAll()

        // Actualizar la caché global
        supplierCache = proveedoresDisponibles
        loadError = null

        // Actualizar estado local
        setSuppliers(supplierCache)
        setError(null)
      } catch (err) {
        console.error('Error fetching suppliers:', err)
        loadError =
          err instanceof Error
            ? err
            : new Error('Error desconocido al obtener proveedores')
        setError(loadError)
      } finally {
        isLoading = false
        setLoading(false)
        notifyListeners()
      }
    }

    fetchSuppliers()
  }, [])

  // Función para forzar actualización (limpia la caché)
  const refreshSuppliers = () => {
    supplierCache = null
    isLoading = false
    loadError = null

    // Iniciamos una nueva carga
    const fetchSuppliers = async () => {
      try {
        isLoading = true
        setLoading(true)

        // Simulación o llamada real a API
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const proveedoresDisponibles = [
          { id: 1, name: 'Proveedor X' },
          { id: 2, name: 'Proveedor Y' },
          { id: 3, name: 'Proveedor Z' },
          // Podría incluir datos actualizados
          { id: 4, name: 'Proveedor W (Nuevo)' },
        ]

        // Actualizar caché global
        supplierCache = proveedoresDisponibles
        loadError = null

        // Actualizar estado local
        setSuppliers(supplierCache)
        setError(null)
      } catch (err) {
        console.error('Error refreshing suppliers:', err)
        loadError =
          err instanceof Error
            ? err
            : new Error('Error desconocido al obtener proveedores')
        setError(loadError)
      } finally {
        isLoading = false
        setLoading(false)
        notifyListeners()
      }
    }

    fetchSuppliers()
  }

  return { suppliers, loading, error, refreshSuppliers }
}
