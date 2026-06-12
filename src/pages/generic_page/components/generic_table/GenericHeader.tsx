import React, { useState, useCallback, ReactNode } from "react"
import { Plus } from "lucide-react"
import { Button } from "../../../../components/ui"
import HeaderTitle from "../HeaderTitle"
import { Modal } from "../../../components/modal/Modal"

export interface GenericHeaderProps<T> {
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
  /** Acciones extra mostradas junto al botón de crear (ej: botón Escanear) */
  extraActions?: ReactNode
}

const DEFAULT_CREATE_TEXT = "Nuevo"
const DEFAULT_MODAL_TITLE = "Crear Nuevo"
const DEFAULT_MODAL_DESCRIPTION = "Completa los detalles. Todos los campos son requeridos."

function GenericHeaderInner<T>({
  onItemCreated,
  title,
  headerClassName,
  createButtonText = DEFAULT_CREATE_TEXT,
  modalTitle = DEFAULT_MODAL_TITLE,
  modalDescription = DEFAULT_MODAL_DESCRIPTION,
  renderCreateForm,
  buttonIcon,
  buttonClassName,
  renderCustomButton,
  extraActions
}: GenericHeaderProps<T>) {
  const [open, setOpen] = useState(false)

  const openModal = useCallback(() => setOpen(true), [])
  const closeModal = useCallback(() => setOpen(false), [])

  const defaultButton = (
    <Button
      variant="primary"
      onClick={openModal}
      leftIcon={buttonIcon ?? <Plus className='h-4 w-4' />}
      className={`w-full sm:w-fit ${buttonClassName ?? ''}`}
      title={createButtonText}
    >
      {createButtonText}
    </Button>
  )

  return (
    <section className='flex w-full flex-col gap-4 rounded-lg border border-(--view-accent-border,var(--color-border)) bg-(--view-accent-soft,var(--color-bg-surface)) px-4 py-4 shadow-xs sm:flex-row sm:items-center sm:justify-between md:px-5'>
      <div className='flex min-w-0 items-center gap-3'>
        <span className='h-10 w-1 rounded-full bg-(--view-accent,var(--color-action-bg))' aria-hidden='true' />
        <HeaderTitle title={title} className={headerClassName} />
      </div>

      <div className='flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center'>
        {extraActions}
        {renderCustomButton ? renderCustomButton(openModal) : defaultButton}
      </div>

      <Modal open={open} onClose={closeModal} title={modalTitle} description={modalDescription}>
        {renderCreateForm(closeModal, onItemCreated)}
      </Modal>
    </section>
  )
}

const GenericHeader = React.memo(GenericHeaderInner) as typeof GenericHeaderInner

export default GenericHeader
