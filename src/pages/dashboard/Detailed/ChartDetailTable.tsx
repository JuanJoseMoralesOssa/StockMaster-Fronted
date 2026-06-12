import { FileSpreadsheet } from 'lucide-react'
import { Button } from '../../../components/ui'
import PaymentStatusBadge from './PaymentStatusBadge'

export interface ChartMonthlyRow {
  name: string
  Total: number
  Pagado: number
  Pendiente: number
}

interface ChartDetailTableProps {
  /** Card heading, e.g. "Detalle Mensual por Proveedor". */
  title: string
  /** Label for the first column, e.g. "Mes / Proveedor" or "Mes". */
  firstColumnLabel: string
  rows: ChartMonthlyRow[]
  totals: Pick<ChartMonthlyRow, 'Total' | 'Pagado' | 'Pendiente'>
  /** Triggers the parent's Excel export (each chart builds its own workbook). */
  onExport: () => void
}

const TH = 'px-3 sm:px-6 py-3 text-left text-xs font-medium text-(--color-text-secondary) uppercase tracking-wider'
const TH_NUMERIC = 'px-3 sm:px-6 py-3 text-right text-xs font-medium text-(--color-text-secondary) uppercase tracking-wider tabular-nums'
const TD = 'px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap'
const TD_NUMERIC = 'px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right tabular-nums'

/**
 * Monthly payment breakdown table shared by the detailed Product and Supplier
 * charts. Keeps the markup, tokens and status pills in one place; the parent
 * owns the Excel export because each report builds a different workbook.
 */
export default function ChartDetailTable({
  title,
  firstColumnLabel,
  rows,
  totals,
  onExport,
}: Readonly<ChartDetailTableProps>) {
  return (
    <div className="bg-(--color-bg-surface) p-4 rounded-lg shadow">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <h2 className="text-lg font-medium">{title}</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onExport}
          leftIcon={<FileSpreadsheet className="h-4 w-4" aria-hidden="true" />}
          className="text-success-700 bg-success-50 border-[1.5px] border-success-200 hover:bg-success-100 hover:border-success-300"
        >
          Exportar a Excel
        </Button>
      </div>
      {/* Only the table scrolls horizontally; the heading and export button stay pinned. */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-(--color-border)">
          <thead className="bg-(--color-bg-subtle)">
            <tr>
              <th className={TH}>{firstColumnLabel}</th>
              <th className={TH_NUMERIC}>Total</th>
              <th className={TH_NUMERIC}>Pagado</th>
              <th className={TH_NUMERIC}>Pendiente</th>
              <th className={TH}>Estado</th>
            </tr>
          </thead>
          <tbody className="bg-(--color-bg-surface) divide-y divide-(--color-border)">
            {rows.map((month) => (
              <tr key={month.name} className="hover:bg-(--color-bg-subtle) transition-colors">
                <td className={`${TD} font-medium`}>{month.name}</td>
                <td className={TD_NUMERIC}>{month.Total.toLocaleString()}</td>
                <td className={`${TD_NUMERIC} text-success-700`}>{month.Pagado.toLocaleString()}</td>
                <td className={`${TD_NUMERIC} text-danger-700`}>{month.Pendiente.toLocaleString()}</td>
                <td className={TD}>
                  <PaymentStatusBadge total={month.Total} pagado={month.Pagado} pendiente={month.Pendiente} />
                </td>
              </tr>
            ))}
            <tr className="bg-(--color-bg-subtle) font-semibold">
              <td className={TD}>TOTAL</td>
              <td className={TD_NUMERIC}>{totals.Total.toLocaleString()}</td>
              <td className={`${TD_NUMERIC} text-success-700`}>{totals.Pagado.toLocaleString()}</td>
              <td className={`${TD_NUMERIC} text-danger-700`}>{totals.Pendiente.toLocaleString()}</td>
              <td className={TD}>
                <PaymentStatusBadge total={totals.Total} pagado={totals.Pagado} pendiente={totals.Pendiente} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
