import { useState, useEffect } from 'react'
import Product from '../types/Product'
import { productService } from '../services/ProductService'

// Caché global a nivel de módulo (persiste entre renders)
let productCache: Product[] | null = null
let isLoading = false
let loadError: Error | null = null
let listeners: Function[] = []

// Función para notificar a todos los suscriptores
const notifyListeners = () => {
  listeners.forEach((listener) => listener())
}

export const useAvailableProducts = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (productCache) {
      setProducts(productCache)
      setLoading(false)
      return
    }

    // Si ya hay una carga en progreso, esperamos
    if (isLoading) {
      // Nos suscribimos a actualizaciones
      const updateState = () => {
        setProducts(productCache || [])
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
    const fetchProducts = async () => {
      if (isLoading || productCache) return

      try {
        isLoading = true
        setLoading(true)

        // Simulación o llamada real a API
        // await new Promise((resolve) => setTimeout(resolve, 1000))
        // const productosDisponibles = [
        //     { id: 1, name: 'Producto A' },
        //     { id: 2, name: 'Producto B' },
        //     { id: 3, name: 'Producto C' },
        // ]
        const productosDisponibles = await productService.getAll().catch((error) => {
          console.error('Error fetching products:', error)
          alert('Error al obtener productos')
          setLoading(false)
          setError(error)
          return []
        })

        //         const response = await fetch('/api/products')
        //         // Verificar si la respuesta es exitosa
        //         if (!response.ok) {
        //             throw new Error(`Error HTTP: ${response.status}`)
        //         }
        //         const data = await response.json()
        //         setProducts(data)

        // Actualizar la caché global
        productCache = productosDisponibles
        loadError = null

        // Actualizar estado local
        setProducts(productCache)
        setError(null)
      } catch (err) {
        console.error('Error fetching products:', err)
        loadError =
          err instanceof Error
            ? err
            : new Error('Error desconocido al obtener productos')
        setError(loadError)
      } finally {
        isLoading = false
        setLoading(false)
        notifyListeners()
      }
    }

    fetchProducts()
  }, [])

  // Función para forzar actualización (limpia la caché)
  const refreshProducts = () => {
    productCache = null
    isLoading = false
    loadError = null

    // Iniciamos una nueva carga
    const fetchProducts = async () => {
      try {
        isLoading = true
        setLoading(true)

        // Simulación o llamada real a API
        // await new Promise((resolve) => setTimeout(resolve, 1000))
        // const productosDisponibles = [
        //   { id: 1, name: 'Producto A' },
        //   { id: 2, name: 'Producto B' },
        //   { id: 3, name: 'Producto C' },
        //   // Podría incluir datos actualizados
        //   { id: 4, name: 'Producto D (Nuevo)' },
        //   ]
        const productosDisponibles = await productService.getAll()
        //         // Llamada a la API
        //         const response = await fetch('/api/products')
        //         // Verificar si la respuesta es exitosa
        //         if (!response.ok) {
        //             throw new Error(`Error HTTP: ${response.status}`)
        //         }
        //         const data = await response.json()
        //         setProducts(data)

        // Actualizar caché global
        productCache = productosDisponibles
        loadError = null

        // Actualizar estado local
        setProducts(productCache)
        setError(null)
      } catch (err) {
        console.error('Error refreshing products:', err)
        loadError =
          err instanceof Error
            ? err
            : new Error('Error desconocido al obtener productos')
        setError(loadError)
      } finally {
        isLoading = false
        setLoading(false)
        notifyListeners()
      }
    }

    fetchProducts()
  }

  return { products, loading, error, refreshProducts }
}
