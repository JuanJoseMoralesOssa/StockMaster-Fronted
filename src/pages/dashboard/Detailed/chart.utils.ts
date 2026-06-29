import { formatKg } from '../../../utils/format'

export const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export const CHART_HEIGHTS = {
  // `xl` is used for the two primary charts on desktop, where the cards are wide
  // enough that the extra height lets the bars breathe and the pie grow (its
  // radius is bound by the smaller of width/height).
  xl: 420,
  large: 350,
  medium: 280,
  small: 220,
} as const

export const CHART_MARGINS = {
  withBottomLabels: { top: 20, right: 30, left: 20, bottom: 70 },
  standard: { top: 20, right: 30, left: 20, bottom: 50 },
  compact: { top: 10, right: 20, left: 10, bottom: 30 },
  inline: { top: 20, right: 30, left: 20, bottom: 5 },
} as const

// Paleta semántica unificada para TODOS los charts y pies del dashboard. El
// color codifica el SIGNIFICADO de la serie (no qué gráfico es), así la leyenda
// se aprende una sola vez y coincide con la tabla de detalle, donde Pagado ya es
// verde (success) y Pendiente rojo (danger). Tonos 500 (≈ tokens de estado).
export const CHART_COLORS = {
  total: '#3b82f6', // Total / Compras / Pedido — azul base (neutro)
  paid: '#22c55e', // Pagado / Pago — verde (≈ --color-success-500)
  pending: '#ef4444', // Pendiente — rojo (≈ --color-danger-500)
  // Rellenos de encabezado para exportación a Excel (ARGB, sin '#').
  headerFill: 'D9E1F2',
  headerFillBlue: '4472C4',
} as const

export const formatMonthName = (date: Date): string =>
  `${monthNames[date.getMonth()]} ${date.getFullYear()}`

export const formatChartValue = (value: unknown): string => {
  if (Array.isArray(value)) return value.map(item => String(item)).join(', ')
  // Pesos con punto decimal, sin ceros sobrantes. Coacciona strings numéricos
  // (columnas `numeric` del backend).
  if (typeof value === 'number') return formatKg(value)
  if (typeof value === 'string') {
    const n = Number(value)
    return Number.isFinite(n) ? formatKg(n) : value
  }
  return ''
}

export const formatChartPercent = (percent: number | undefined): string =>
  `${((percent ?? 0) * 100).toFixed(0)}%`

const compactNumberFormatter = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

/**
 * Short label for on-chart display (e.g. 1.2M, 12K) so the value is readable
 * without hovering. Returns '' for 0/non-numeric to avoid cluttering empty bars.
 */
export const formatCompactNumber = (value: unknown): string => {
  const num = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(num) || num === 0) return ''
  return compactNumberFormatter.format(num)
}

/**
 * Shared <LabelList> props that print each bar's value just above it, so the
 * dashboards are readable at a glance without a hover. Spread onto a LabelList
 * placed inside a <Bar>; it inherits the bar's dataKey automatically.
 */
export const BAR_VALUE_LABEL = {
  position: 'top',
  offset: 4,
  fontSize: 9,
  className: 'fill-(--color-text-secondary)',
  formatter: formatCompactNumber,
} as const

type CsvCell = string | number | boolean | null | undefined

function serializeCsvCell(value: CsvCell, delimiter: string): string {
  // Los números se exportan con el MISMO formato que en pantalla (formatKg: punto
  // decimal, máx. 3 decimales). String() crudo filtraría ruido de coma flotante
  // (0.1+0.2 → "0.30000000000000004") y notación exponencial en valores enormes.
  const rawText = value == null ? '' : typeof value === 'number' ? formatKg(value) : String(value)
  const text = typeof value === 'string' && /^[=+\-@]/.test(rawText)
    ? `'${rawText}`
    : rawText
  const shouldQuote =
    text.includes(delimiter) ||
    text.includes('"') ||
    text.includes('\n') ||
    text.includes('\r')

  if (!shouldQuote) return text
  return `"${text.replaceAll('"', '""')}"`
}

/** Triggers a browser download for a spreadsheet-compatible UTF-8 CSV file. */
export function downloadCsvFile(
  rows: CsvCell[][],
  filename: string,
  delimiter = ';',
): void {
  const csv = rows
    .map((row) => row.map((cell) => serializeCsvCell(cell, delimiter)).join(delimiter))
    .join('\r\n')
  const blob = new Blob([`\ufeff${csv}`], {
    type: 'text/csv;charset=utf-8',
  })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}
