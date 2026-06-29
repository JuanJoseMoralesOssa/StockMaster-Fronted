import Person from '../../../types/Person'
import Product from '../../../types/Product'
import { useMediaQuery } from '../../../hooks/useMediaQuery'
import { formatKg } from '../../../utils/format'

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
  // Table on md+ (fits inside the expanded row); stacked cards on mobile so the
  // three columns never get crushed inside the surrounding card's nested padding.
  const isDesktop = useMediaQuery('(min-width: 768px)')

  if (details.length === 0) {
    return null
  }

  const productName = (detail: TDetail) =>
    products.find((product) => product.id === detail.productId)?.name || detail.productId || '—'
  const supplierName = (detail: TDetail) =>
    suppliers.find((supplier) => supplier.id === detail.personId)?.name || detail.personId || '—'

  return (
    <div>
      {title && <h4 className='mb-4 text-sm font-semibold text-(--color-text-primary)'>{title}</h4>}

      {isDesktop ? (
        <div className='overflow-x-auto rounded-lg border border-(--color-border) bg-(--color-bg-surface) shadow-xs'>
          <table className='w-full text-sm'>
            <thead className='border-b border-(--color-border) bg-(--view-accent-soft,var(--color-bg-subtle))'>
              <tr>
                <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-(--color-text-secondary)'>Producto</th>
                <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-(--color-text-secondary)'>Proveedor</th>
                <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-(--color-text-secondary)'>Peso (KG)</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-(--color-border)'>
              {details.map((detail, index) => (
                <tr key={detail.id ?? `detail-${index}`} className='bg-(--color-bg-surface) transition-colors hover:bg-(--color-bg-subtle)'>
                  <td className='px-4 py-3 text-(--color-text-primary)'>{productName(detail)}</td>
                  <td className='px-4 py-3 text-(--color-text-primary)'>{supplierName(detail)}</td>
                  <td className='px-4 py-3 text-right tabular-nums text-(--color-text-primary)'>{formatKg(detail.weight_kg ?? 0)} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <ul className='flex flex-col gap-2'>
          {details.map((detail, index) => (
            <li
              key={detail.id ?? `detail-${index}`}
              className='rounded-lg border border-(--color-border) bg-(--color-bg-surface) p-3 shadow-xs'
            >
              <p className='font-medium text-(--color-text-primary)'>{productName(detail)}</p>
              <dl className='mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm'>
                <dt className='text-(--color-text-secondary)'>Proveedor</dt>
                <dd className='text-right text-(--color-text-primary)'>{supplierName(detail)}</dd>
                <dt className='text-(--color-text-secondary)'>Peso</dt>
                <dd className='text-right tabular-nums text-(--color-text-primary)'>{formatKg(detail.weight_kg ?? 0)} kg</dd>
              </dl>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
