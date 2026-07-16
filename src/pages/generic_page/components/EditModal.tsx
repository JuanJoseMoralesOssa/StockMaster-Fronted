import React from 'react'
import { Modal } from '../../components/modal/Modal'
import { GenericField } from '../../../types/GenericConfig'
import GenericForm from './generic_form/GenericForm'

interface EditModalProps<T> {
  isOpen: boolean
  selectedItem: T | null
  entityName: string
  renderEditForm?: (
    item: T,
    onSuccess: () => void,
    onItemUpdated: (item: T) => void,
    onItemDeleted: (id: string | number) => void,
  ) => React.ReactNode
  formFields?: GenericField<T>[]
  onUpdate?: (id: number | string, data: Partial<T>) => Promise<T>
  prepareDataForSubmit?: (data: Partial<T>, isEdit: boolean) => Promise<Partial<T>>
  className?: string
  onEditSuccess: (updatedItem: T) => void
  onEditDeleted: (id: string | number) => void
  onClose: () => void
}

function buildEditableInitialData<T extends object>(item: T, fields?: GenericField<T>[]): Partial<T> {
  if (!fields || fields.length === 0) {
    return item
  }

  return fields.reduce<Partial<T>>((accumulator, field) => {
    const fieldName = field.name as keyof T
    accumulator[fieldName] = item[fieldName]
    return accumulator
  }, {})
}

export default function EditModal<T extends object>({
  isOpen,
  selectedItem,
  entityName,
  renderEditForm,
  formFields,
  onUpdate,
  prepareDataForSubmit,
  className,
  onEditSuccess,
  onEditDeleted,
  onClose
}: EditModalProps<T>) {
  if (!selectedItem) return null

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={`Editar ${entityName}`}
      description={`Actualiza la información del ${entityName}`}
      className={className}
    >
      {renderEditForm ? (
        renderEditForm(
          selectedItem,
          () => onClose(),
          (updatedItem) => {
            onEditSuccess(updatedItem)
            onClose()
          },
          (id) => {
            onEditDeleted(id)
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
            // `selectedItem` is only known to be `object` here, but every
            // GenericPageConfig sets `idField: 'id'` and this default edit-form
            // path has always assumed the id lives under `.id` — previously
            // hidden behind `T extends Record<string, any>`'s implicit index
            // signature. Made explicit instead of implicit; behavior is unchanged.
            const { id } = selectedItem as unknown as { id: string | number }
            const updated = await onUpdate(id, dataToSubmit)
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
