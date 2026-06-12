import { Badge } from '../../../components/ui'

interface PaymentStatusBadgeProps {
  total: number
  pagado: number
  pendiente: number
}

/**
 * Status pill for a payment row: no activity / fully paid / partially paid.
 * Maps payment state onto the shared `Badge` semantic variants so the chart
 * tables stay on the design system.
 */
export default function PaymentStatusBadge({ total, pagado, pendiente }: Readonly<PaymentStatusBadgeProps>) {
  if (total === 0) return <Badge variant="default">Sin movimientos</Badge>
  if (pendiente === 0) return <Badge variant="success">Completo</Badge>
  return <Badge variant="warning">{((pagado / total) * 100).toFixed(1)}% Pagado</Badge>
}
