export const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export const CHART_HEIGHTS = {
  large: 'h-[clamp(300px,35vh,420px)]',
  medium: 'h-[clamp(250px,30vh,360px)]',
  small: 'h-[clamp(200px,24vh,280px)]',
} as const

export const CHART_MARGINS = {
  withBottomLabels: { top: 20, right: 30, left: 20, bottom: 70 },
  standard: { top: 20, right: 30, left: 20, bottom: 50 },
  compact: { top: 10, right: 20, left: 10, bottom: 30 },
  inline: { top: 20, right: 30, left: 20, bottom: 5 },
} as const

export const CHART_COLORS = {
  purchase: '#8884d8',
  paid: '#82ca9d',
  pending: '#ff8042',
  blue: '#60a5fa',
  green: '#4ade80',
  red: '#f87171',
  pieBlue: '#0088FE',
  pieOrange: '#FF8042',
  headerFill: 'D9E1F2',
  headerFillBlue: '4472C4',
} as const

export const formatMonthName = (date: Date): string =>
  `${monthNames[date.getMonth()]} ${date.getFullYear()}`

export const formatChartValue = (value: unknown): string => {
  if (Array.isArray(value)) return value.map(item => String(item)).join(', ')
  if (typeof value === 'number') return value.toLocaleString()
  if (typeof value === 'string') return value
  return ''
}

export const formatChartPercent = (percent: number | undefined): string =>
  `${((percent ?? 0) * 100).toFixed(0)}%`

type CsvCell = string | number | boolean | null | undefined

function serializeCsvCell(value: CsvCell, delimiter: string): string {
  const rawText = value == null ? '' : String(value)
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
