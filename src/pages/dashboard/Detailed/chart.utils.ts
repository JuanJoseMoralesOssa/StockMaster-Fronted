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

/** Triggers a browser download for an Excel (.xlsx) buffer. */
export async function downloadXlsxBlob(
  buffer: ArrayBuffer,
  filename: string,
): Promise<void> {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}
