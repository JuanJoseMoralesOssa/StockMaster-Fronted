import React from 'react'
import { Modal } from '../../components/modal/Modal'
import { GenericField } from '../../../types/GenericConfig'
import GenericForm from './generic_form/GenericForm'

interface EditModalProps<T> {
  isOpen: boolean
  selectedItem: T | null
  entityName: string
  renderEditForm?: (item: T, onSuccess: () => void, onItemUpdated: (item: T) => void) => React.ReactNode
  formFields?: GenericField<T>[]
  onUpdate?: (id: number | string, data: Partial<T>) => Promise<T>
  prepareDataForSubmit?: (data: Partial<T>, isEdit: boolean) => Promise<Partial<T>>
  onEditSuccess: (updatedItem: T) => void
  onClose: () => void
}

function buildEditableInitialData<T extends Record<string, unknown>>(item: T, fields?: GenericField<T>[]) {
  if (!fields || fields.length === 0) {
    return item
  }

  return fields.reduce<Partial<T>>((accumulator, field) => {
    const fieldName = field.name as keyof T
    accumulator[fieldName] = item[fieldName]
    return accumulator
  }, {})
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
      className="sm:max-w-fit"
    >
      {renderEditForm ? (
        renderEditForm(
          selectedItem,
          () => onClose(),
          (updatedItem) => {
            onEditSuccess(updatedItem)
            onClose()
          }
        )
      ) : formFields && onUpdate ? (
        <GenericForm<T>
          fields={formFields.filter((field) => !field.hideOnEdit)}
          initialData={buildEditableInitialData(
            selectedItem,
            formFields.filter((field) => !field.hideOnEdit),
          )}
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
