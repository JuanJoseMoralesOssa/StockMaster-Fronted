import Person from '../../../types/Person'
import Product from '../../../types/Product'

interface DetailLike {
  id?: number
  productId?: number
  personId?: number
  weight_kg?: number
}

interface DocumentDetailsExpandedViewProps<TDetail extends DetailLike> {
  details: TDetail[]
  title?: string
  products: Product[]
  suppliers: Person[]
}

export default function DocumentDetailsExpandedView<TDetail extends DetailLike>({
  details,
  title,
  products,
  suppliers,
}: Readonly<DocumentDetailsExpandedViewProps<TDetail>>) {
  if (details.length === 0) {
    return null
  }

  return (
    <div>
      {title && <h4 className='text-sm font-semibold text-gray-900 mb-4'>{title}</h4>}
      <div className='rounded-lg border border-gray-200 bg-white overflow-hidden shadow-xs'>
        <table className='w-full text-sm'>
          <thead className='border-b border-gray-200 bg-gray-50'>
            <tr>
              <th className='px-4 py-3 text-left font-semibold text-xs text-gray-600 uppercase tracking-wide'>Producto</th>
              <th className='px-4 py-3 text-left font-semibold text-xs text-gray-600 uppercase tracking-wide'>Proveedor</th>
              <th className='px-4 py-3 text-right font-semibold text-xs text-gray-600 uppercase tracking-wide'>Peso (KG)</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200'>
            {details.map((detail, index) => (
              <tr key={detail.id ?? `detail-${index}`} className='bg-white hover:bg-gray-50 transition-colors'>
                <td className='px-4 py-3 text-gray-900'>
                  {products.find((product) => product.id === detail.productId)?.name || detail.productId || '—'}
                </td>
                <td className='px-4 py-3 text-gray-900'>
                  {suppliers.find((supplier) => supplier.id === detail.personId)?.name || detail.personId || '—'}
                </td>
                <td className='px-4 py-3 text-right tabular-nums text-gray-900'>
                  {detail.weight_kg ?? 0} kg
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
