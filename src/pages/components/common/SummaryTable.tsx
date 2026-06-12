import { ProductSummary } from '../../../types/ProductSummary'

interface SummaryTableProps {
    data: ProductSummary[]
    title: string
    valueLabel: string
    valueField: keyof ProductSummary
}

const SummaryTable: React.FC<SummaryTableProps> = ({
    data,
    title,
    valueLabel,
    valueField,
}) => {
    const total = data.reduce((sum, item) => sum + Number(item[valueField]), 0)

    return (
        <div className='w-full rounded-lg border border-(--color-border) bg-(--color-bg-surface) shadow-xs overflow-hidden'>
            <div className='px-4 py-3 border-b border-(--color-border) bg-(--color-bg-subtle)'>
                <h3 className='text-sm font-semibold text-(--color-text-primary)'>{title}</h3>
            </div>
            <table className='w-full table-auto text-sm'>
                <thead>
                    <tr className='border-b border-(--color-border) bg-(--color-bg-subtle)'>
                        <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-(--color-text-secondary)'>Producto</th>
                        <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-(--color-text-secondary)'>{valueLabel}</th>
                    </tr>
                </thead>
                <tbody className='divide-y divide-(--color-border)'>
                    {data.map((item) => (
                        <tr className='bg-(--color-bg-surface) hover:bg-(--color-bg-subtle) transition-colors' key={item.id}>
                            <td className='px-4 py-3 whitespace-normal wrap-break-word text-(--color-text-primary)'>{item.name}</td>
                            <td className='px-4 py-3 whitespace-nowrap text-right text-(--color-text-primary)'>
                                {(item[valueField] as number).toLocaleString(
                                    'es-ES',
                                    {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    }
                                )}
                            </td>
                        </tr>
                    ))}
                    <tr className='bg-(--color-bg-subtle) font-semibold border-t border-(--color-border)'>
                        <td className='px-4 py-3 whitespace-nowrap text-(--color-text-primary)'>Total</td>
                        <td className='px-4 py-3 whitespace-nowrap text-right text-(--color-text-primary)'>
                            {total.toLocaleString('es-ES', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

export default SummaryTable
