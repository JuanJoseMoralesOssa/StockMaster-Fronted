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
        <div className='w-full rounded-lg border border-gray-200 bg-white shadow-xs overflow-hidden'>
            <div className='px-4 py-3 border-b border-gray-200 bg-gray-50'>
                <h3 className='text-sm font-semibold text-gray-900'>{title}</h3>
            </div>
            <table className='w-full table-auto text-sm'>
                <thead>
                    <tr className='border-b border-gray-200 bg-gray-50'>
                        <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600'>Producto</th>
                        <th className='px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600'>{valueLabel}</th>
                    </tr>
                </thead>
                <tbody className='divide-y divide-gray-200'>
                    {data.map((item) => (
                        <tr className='bg-white hover:bg-gray-50 transition-colors' key={item.id}>
                            <td className='px-4 py-3 whitespace-nowrap text-gray-900'>{item.name}</td>
                            <td className='px-4 py-3 whitespace-nowrap text-right text-gray-900'>
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
                    <tr className='bg-gray-50 font-semibold border-t border-gray-200'>
                        <td className='px-4 py-3 whitespace-nowrap text-gray-900'>Total</td>
                        <td className='px-4 py-3 whitespace-nowrap text-right text-gray-900'>
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
