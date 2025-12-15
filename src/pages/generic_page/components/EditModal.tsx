import React from 'react'
import { Modal } from '../../components/modal/Modal'
import { GenericField } from '../../../types/GenericConfig'
import GenericForm from './generic_form/GenericForm'

interface EditModalProps<T> {
  isOpen: boolean
  selectedItem: T | null
  entityName: string
  renderEditForm?: (item: T, onSuccess: () => void, onCancel: () => void) => React.ReactNode
  formFields?: GenericField<T>[]
  onUpdate?: (id: number | string, data: Partial<T>) => Promise<T>
  prepareDataForSubmit?: (data: Partial<T>, isEdit: boolean) => Promise<Partial<T>>
  onEditSuccess: (updatedItem: T) => void
  onClose: () => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function EditModal<T extends Record<string, any>>({
  isOpen,
  selectedItem,
  entityName,
  renderEditForm,
  formFields,
  onUpdate,
  prepareDataForSubmit,
  onEditSuccess,
  onClose
}: EditModalProps<T>) {
  if (!selectedItem) return null

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={`Editar ${entityName}`}
      description={`Actualiza la información del ${entityName}`}
      className="sm:max-w-150"
    >
      {renderEditForm ? (
        renderEditForm(
          selectedItem,
          () => onClose(),
          () => onClose()
        )
      ) : formFields && onUpdate ? (
        <GenericForm<T>
          fields={formFields}
          initialData={selectedItem}
          onSubmit={async (formData: Partial<T>) => {
            let dataToSubmit = formData
            if (prepareDataForSubmit) {
              dataToSubmit = await prepareDataForSubmit(formData, true)
            }
            const updated = await onUpdate(selectedItem.id, dataToSubmit)
            onEditSuccess(updated)
          }}
          onCancel={onClose}
          submitLabel="Actualizar"
        />
      ) : (
        <p>No hay formulario de edición configurado</p>
      )}
    </Modal>
  )
}
