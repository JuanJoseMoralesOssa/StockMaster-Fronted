import React from 'react'
import { formatChartValue } from './chart.utils'

interface PieValueLabelProps {
  x?: number
  y?: number
  value?: number | string
  textAnchor?: 'start' | 'middle' | 'end' | 'inherit'
}

/**
 * Renders each pie slice's value right on the slice's label position so the
 * amount is visible without hovering. Used as the `label` prop of a <Pie>.
 */
export const renderPieValueLabel = ({
  x,
  y,
  value,
  textAnchor,
}: PieValueLabelProps): React.ReactElement | null => {
  if (value === undefined || value === null || value === 0) return null
  return (
    <text
      x={x}
      y={y}
      textAnchor={textAnchor}
      dominantBaseline="central"
      fontSize={11}
      fontWeight={600}
      className="fill-(--color-text-primary)"
    >
      {formatChartValue(value)}
    </text>
  )
}
