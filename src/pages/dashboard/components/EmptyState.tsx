import { BarChart3 } from "lucide-react"

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-brand-50 to-brand-100 flex items-center justify-center text-brand-600 mb-4">
        <BarChart3 className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-(--color-text-primary) mb-1">Sin resultados aún</h3>
      <p className="text-sm text-(--color-text-muted) max-w-xs">
        Selecciona filtros y presiona <strong>Buscar</strong> para ver el detalle de transacciones.
      </p>
    </div>
  )
}

export default EmptyState
