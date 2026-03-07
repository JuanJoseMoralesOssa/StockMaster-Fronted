interface ActionButtonsProps {
  onSearch: () => void
  onClear: () => void
}

function ActionButtons({ onSearch, onClear }: Readonly<ActionButtonsProps>) {
  return (
    <div className="flex flex-wrap gap-3 mt-2 md:mt-0">
      <button
        onClick={onSearch}
        className="px-4 py-2 rounded-lg text-white text-[13.5px] font-semibold bg-blue-600 hover:bg-blue-700 shadow-[0_1px_4px_rgba(37,99,235,0.3)] hover:shadow-[0_4px_12px_rgba(37,99,235,0.35)] transition-all"
      >
        🔍 Buscar
      </button>
      <button
        onClick={onClear}
        className="px-4 py-2 rounded-lg text-gray-600 text-[13.5px] font-semibold bg-transparent border-[1.5px] border-gray-200 hover:bg-gray-100 hover:text-gray-900 transition-all"
      >
        ✕ Limpiar Filtros
      </button>
    </div>
  )
}

export default ActionButtons
