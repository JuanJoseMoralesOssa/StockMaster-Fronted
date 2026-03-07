function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-50 to-purple-50 flex items-center justify-center text-[28px] mb-4">
        📊
      </div>
      <h3 className="text-[15px] font-semibold text-gray-900 mb-1">Sin resultados aún</h3>
      <p className="text-[13.5px] text-gray-500 max-w-xs">
        Selecciona filtros y presiona <strong>Buscar</strong> para ver el detalle de transacciones.
      </p>
    </div>
  )
}

export default EmptyState
