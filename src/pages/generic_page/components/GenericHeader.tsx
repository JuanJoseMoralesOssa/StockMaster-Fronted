import { Plus } from "lucide-react"
import { Modal } from "../../components/modal/Modal"
import { useState, ReactNode } from "react"
import HeaderTitle from "./HeaderTitle"

interface GenericHeaderProps<T> {
  /** Función que se ejecuta cuando se crea un nuevo elemento */
  onItemCreated: (newItem: T) => void
  /** Título del header */
  title: string
  /** Clase CSS adicional para el título */
  headerClassName?: string
  /** Texto del botón de crear */
  createButtonText?: string
  /** Título del modal de creación */
  modalTitle?: string
  /** Descripción del modal de creación */
  modalDescription?: string
  /** Renderizado del formulario de creación */
  renderCreateForm: (onSuccess: () => void, onItemCreated: (item: T) => void) => ReactNode
  /** Ícono personalizado para el botón (opcional) */
  buttonIcon?: ReactNode
  /** Clase CSS adicional para el botón */
  buttonClassName?: string
  /** Función personalizada para renderizar el botón completo (sobrescribe el botón por defecto) */
  renderCustomButton?: (onClick: () => void) => ReactNode
}

function GenericHeader<T>({
  onItemCreated,
  title,
  headerClassName,
  createButtonText = "Nuevo",
  modalTitle = "Crear Nuevo",
  modalDescription = "Completa los detalles. Todos los campos son requeridos.",
  renderCreateForm,
  buttonIcon,
  buttonClassName,
  renderCustomButton
}: GenericHeaderProps<T>) {
  const [open, setOpen] = useState(false)

  const defaultButton = (
    <button
      onClick={() => setOpen(true)}
      className={buttonClassName || 'flex items-center justify-center gap-2 p-2 border rounded-lg text-white bg-blue-500 border-gray-50 hover:bg-blue-600 hover:border-gray-800 transition-colors'}>
      {buttonIcon || <Plus className='md:mr-2 h-4 w-4' />}
      <p>{createButtonText}</p>
    </button>
  )

  return (
    <section className='flex items-center justify-between gap-4 p-2 mr-10 md:mr-5 max-w-fit'>
      <HeaderTitle
        title={title}
        className={headerClassName}
      />

      {renderCustomButton ? renderCustomButton(() => setOpen(true)) : defaultButton}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={modalTitle}
        description={modalDescription}
        className="sm:max-w-150">
        {renderCreateForm(() => setOpen(false), onItemCreated)}
      </Modal>
    </section>
  )
}

export default GenericHeader
