import { useState } from 'react'
import { useToast } from '../../../../hooks/useToast'

export function useTableActions<T>(
  entityName: string,
  onDelete: (id: number | string) => Promise<void>,
  updateItem?: (updatedItem: T, idField?: keyof T) => void,
  removeItem?: (itemId: string | number, idField?: keyof T) => void
) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<T | null>(null)
  const [deletingItemId, setDeletingItemId] = useState<string | number | null>(null)

  const { showSuccess, showError, confirmDelete } = useToast()

  const handleDelete = async (item: T, idField: keyof T) => {
    const itemId = item[idField] as string | number
    const confirmed = await confirmDelete(
      `¿Estás seguro de que deseas eliminar este ${entityName}?`,
      `Eliminar ${entityName}`
    )

    if (!confirmed) return

    try {
      setDeletingItemId(itemId)
      await onDelete(itemId)
      if (removeItem) removeItem(itemId, idField)
      showSuccess(`${entityName} eliminado exitosamente`, 'Eliminación exitosa')
    } catch (error) {
      showError(`Error al eliminar ${entityName}`, 'Error')
      console.error(`Error deleting ${entityName}:`, error)
    } finally {
      setDeletingItemId(null)
    }
  }

  const handleEdit = (item: T) => {
    setSelectedItem(item)
    setIsEditModalOpen(true)
  }

  const handleEditSuccess = (updatedItem: T, idField: keyof T) => {
    if (updateItem) updateItem(updatedItem, idField)
    setIsEditModalOpen(false)
    setSelectedItem(null)
    showSuccess(`${entityName} actualizado exitosamente`, 'Actualización exitosa')
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setSelectedItem(null)
  }

  return {
    isEditModalOpen,
    selectedItem,
    deletingItemId,
    handleDelete,
    handleEdit,
    handleEditSuccess,
    closeEditModal
  }
}
