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
        <div className='w-full mx-auto bg-white shadow-sm rounded-xl p-4'>
            <h3 className='text-lg font-medium mb-2'>{title}</h3>
            <table className='w-full border border-gray-50 rounded-xl table-auto text-sm sm:text-base'>
                <thead>
                    <tr className='bg-gray-50 text-left text-gray-600 uppercase text-xs sm:text-sm'>
                        <th className='text-left p-2'>Producto</th>
                        <th className='text-right p-2'>{valueLabel}</th>
                    </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                    {data.map((item) => (
                        <tr className='text-sm sm:text-base' key={item.id}>
                            <td className='p-2 whitespace-nowrap'>{item.name}</td>
                            <td className='p-2 whitespace-nowrap text-right'>
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
                    <tr className='font-bold'>
                        <td className='p-2 whitespace-nowrap'>Total</td>
                        <td className='p-2 whitespace-nowrap text-right'>
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
