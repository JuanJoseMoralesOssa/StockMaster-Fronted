import Expense from '../../../types/Expense'
import Person from '../../../types/Person'
import Product from '../../../types/Product'

interface Props {
  expense: Expense
  products: Product[]
  suppliers: Person[]
  headersLength: number
}

export default function ExpenseDetailsRow({ expense, products, suppliers, headersLength }: Props) {
  if (!expense.id || !expense.expense_details || expense.expense_details.length === 0) return null

  return (
    <tr>
      <td colSpan={headersLength} className="px-0 py-0">
        <div className="bg-gray-50 border-t border-gray-200 py-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Detalles del Gasto del {(() => {
              const date = new Date(expense.date)
              date.setTime(date.getTime() + new Date().getTimezoneOffset() * 60000)
              return date.toLocaleDateString('es-ES')
            })()}
          </h4>
          <div className="bg-white rounded border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Producto</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Proveedor</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Peso (KG)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {expense.expense_details.map((detail) => (
                  <tr key={detail.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-900">
                      {products.find(p => p.id === detail.productId)?.name || detail.productId}
                    </td>
                    <td className="px-4 py-2 text-gray-900">
                      {suppliers.find(s => s.id === detail.personId)?.name || detail.personId}
                    </td>
                    <td className="px-4 py-2 text-gray-900">
                      {detail.weight_kg} kg
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </td>
    </tr>
  )
}
