import { useState, useEffect } from 'react'
import Purchase from '../types/Purchase'
import { purchaseService } from '../services/PurchaseService'

export const useAvailablePurchases = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    // const sample_purchases: Purchase[] = [
    //   {
    //     id: 1,
    //     total_kg: 100,
    //     total_price: 1500.5,
    //     date: '2025-02-16T21:33:09.422Z',
    //     purchase_details: [
    //       {
    //         id: 1,
    //         weight_kg: 50,
    //         productId: 1,
    //       },
    //       {
    //         id: 2,
    //         weight_kg: 50,
    //         productId: 2,
    //       },
    //     ],
    //   },
    //   {
    //     id: 2,
    //     total_kg: 200,
    //     total_price: 2300.75,
    //     date: '2025-02-17T10:15:00.000Z',
    //     purchase_details: [
    //       {
    //         id: 3,
    //         weight_kg: 100,
    //         productId: 1,
    //       },
    //       {
    //         id: 4,
    //         weight_kg: 100,
    //         productId: 3,
    //       },
    //     ],
    //   },
    // ]

    const fetchPurchases = async () => {
      // const response = await fetch('https://api.example.com/purchases')
      // const data = await response.json()
      // return data
      // await new Promise((resolve) => setTimeout(resolve, 1000))
      // setPurchases(sample_purchases)

      setLoading(true)
      // await purchaseService.getAll().then((response) => {
      //   if (response && Array.isArray(response)) {
      //     setPurchases(response)
      //     setError(null)
      //   } else {
      //     setError(new Error('Error al obtener las compras'))
      //   }
      // })

      await purchaseService.getAllWithDetails().then((response) => {
        if (response && Array.isArray(response)) {
          setPurchases(response)
          setError(null)
        } else {
          setError(new Error('Error al obtener las compras'))
        }
      })

      setLoading(false)
      setError(null)
    }
    // const fetchPurchases = async () => {
    //     try {
    //         setLoading(true)
    //         // Llamada a la API
    //         const response = await fetch('/api/purchases')

    //         // Verificar si la respuesta es exitosa
    //         if (!response.ok) {
    //             throw new Error(`Error HTTP: ${response.status}`)
    //         }

    //         const data = await response.json()
    //         setPurchases(data)
    //         setError(null)
    //     } catch (err) {
    //         console.error('Error fetching purchases:', err)
    //         setError(
    //             err instanceof Error
    //                 ? err
    //                 : new Error('Error desconocido al obtener purchaseos')
    //         )
    //         // Mantener los datos anteriores en caso de error
    //     } finally {
    //         setLoading(false)
    //     }
    // }

    fetchPurchases()
  }, [refreshTrigger]) // Se ejecutará cuando refreshTrigger cambie

  // Función para forzar una actualización de los datos
  const refreshPurchases = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return {
    purchases,
    setPurchases,
    loading,
    error,
    refreshPurchases, // Exponemos esta función para permitir actualizaciones manuales
  }
}
