import { useState, useEffect } from 'react'
import Expense from '../types/Expense'
import { expenseService } from '../services/ExpenseService'

export const useAvailableExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    // const sample_expenses: Expense[] = [
    //   {
    //     id: 1,
    //     total_kg: 100,
    //     total_price: 1500.5,
    //     date: '2025-02-16T21:33:09.422Z',
    //     expense_details: [
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
    //     expense_details: [
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

    const fetchExpenses = async () => {
      // const response = await fetch('https://api.example.com/expenses')
      // const data = await response.json()
      // return data
      // await new Promise((resolve) => setTimeout(resolve, 1000))
      // setExpenses(sample_expenses)

      setLoading(true)
      // await expenseService.getAll().then((response) => {
      //   if (response && Array.isArray(response)) {
      //     setExpenses(response)
      //     setError(null)
      //   } else {
      //     setError(new Error('Error al obtener las compras'))
      //   }
      // })

      await expenseService.getAllWithDetails().then((response) => {
        if (response && Array.isArray(response)) {
          setExpenses(response)
          setError(null)
        } else {
          setError(new Error('Error al obtener las compras'))
        }
      })

      setLoading(false)
      setError(null)
    }
    // const fetchExpenses = async () => {
    //     try {
    //         setLoading(true)
    //         // Llamada a la API
    //         const response = await fetch('/api/expenses')

    //         // Verificar si la respuesta es exitosa
    //         if (!response.ok) {
    //             throw new Error(`Error HTTP: ${response.status}`)
    //         }

    //         const data = await response.json()
    //         setExpenses(data)
    //         setError(null)
    //     } catch (err) {
    //         console.error('Error fetching expenses:', err)
    //         setError(
    //             err instanceof Error
    //                 ? err
    //                 : new Error('Error desconocido al obtener expenseos')
    //         )
    //         // Mantener los datos anteriores en caso de error
    //     } finally {
    //         setLoading(false)
    //     }
    // }

    fetchExpenses()
  }, [refreshTrigger]) // Se ejecutará cuando refreshTrigger cambie

  // Función para forzar una actualización de los datos
  const refreshExpenses = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return {
    expenses,
    setExpenses,
    loading,
    error,
    refreshExpenses, // Exponemos esta función para permitir actualizaciones manuales
  }
}
