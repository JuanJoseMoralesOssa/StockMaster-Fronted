import { Pencil, Trash2 } from 'lucide-react'
import { Fragment } from 'react'
import Expense from '../../../types/Expense'
interface Props {
  expense: Expense
  isExpanded: boolean
  toggle: (id?: string | number) => void
  isLoading: boolean
  setIsLoading: (b: boolean) => void
  setIsEditModalOpen: (b: boolean) => void
  setSelectedExpense: (e: Expense) => void
  handleDelete: (expense: Expense) => Promise<void>
}

export default function ExpenseTableRow({
  expense,
  isExpanded,
  toggle,
  isLoading,
  setIsLoading,
  setIsEditModalOpen,
  setSelectedExpense,
  handleDelete,
}: Props) {
  return (
    <Fragment>
      <tr className='text-sm sm:text-base hover:bg-gray-50'>
        <td className='p-2 whitespace-nowrap w-12'>
          <button
            onClick={() => toggle(expense.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors w-5 h-5 flex items-center justify-center"
            title="Ver detalles"
          >
            {expense.id && isExpanded ? '▼' : '▶'}
          </button>
        </td>

        <td className='p-2 whitespace-nowrap'>
          {(() => {
            if (!expense.date) return 'Fecha no disponible'
            const offset = new Date().getTimezoneOffset() * 60000
            const date = new Date(expense.date)
            date.setTime(date.getTime() + offset)
            if (isNaN(date.getTime())) return 'Fecha inválida'
            return date.toLocaleDateString('es-ES', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })
          })()}
        </td>

        <td className='p-2 whitespace-nowrap'>
          {`${expense.total_kg ? expense.total_kg + 'kg' : '-'}`}
        </td>

        <td className='p-2 whitespace-nowrap'>
          {expense.expense_details && expense.expense_details.length > 0 ? (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
              {(() => {
                const uniqueProducts = expense.expense_details.reduce((acc: number[], detail) => {
                  const productId = detail.productId
                  if (productId && !acc.includes(productId)) {
                    acc.push(productId)
                  }
                  return acc
                }, [])
                const count = uniqueProducts.length
                return `${count} producto${count !== 1 ? 's' : ''}`
              })()}
            </span>
          ) : (
            <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs">
              Sin productos
            </span>
          )}
        </td>

        <td className='p-2 whitespace-nowrap'>
          {expense.expense_details && expense.expense_details.length > 0 ? (
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
              {(() => {
                const uniqueSuppliers = expense.expense_details.reduce((acc: number[], detail) => {
                  const personId = detail.personId
                  if (personId && !acc.includes(personId)) {
                    acc.push(personId)
                  }
                  return acc
                }, [])
                const count = uniqueSuppliers.length
                return `${count} proveedor${count !== 1 ? 'es' : ''}`
              })()}
            </span>
          ) : (
            <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs">
              Sin proveedores
            </span>
          )}
        </td>

        <td className='p-2 whitespace-nowrap'>
          {expense.expense_details && expense.expense_details.length > 0 ? (
            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
              {expense.expense_details.length} detalle{expense.expense_details.length !== 1 ? 's' : ''}
            </span>
          ) : (
            <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs">
              Sin detalles
            </span>
          )}
        </td>

        <td className='p-2 flex gap-4 cursor-pointer text-center' onClick={() => setSelectedExpense(expense)}>
          {!isLoading ? (
            <button className='flex items-center text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded text-sm'
              onClick={() => {
                setIsLoading(true)
                setIsEditModalOpen(true)
                setIsLoading(false)
              }}
              disabled={isLoading}>
              <Pencil className='mr-2 h-4 w-4' />
              <span>Editar</span>
            </button>
          ) : <span>Cargando...</span>}
          {!isLoading ? (
            <button className='flex items-center text-red-600 hover:text-red-800 bg-red-50 px-2 py-1 rounded text-sm'
              onClick={() => {
                setIsLoading(true)
                handleDelete(expense)
                setIsLoading(false)
              }}>
              <Trash2 className='mr-2 h-4 w-4' />
              <span>Eliminar</span>
            </button>
          ) : <span>Cargando...</span>}
        </td>
      </tr>
    </Fragment>
  )
}
