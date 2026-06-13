import { useState } from 'react'
import { useToast } from '../../../../hooks/useToast'
import { extractErrorInfo } from '../../../../utils/error'

export function useTableActions<T>(
  entityName: string,
  onDelete: (id: number | string, item?: T) => Promise<void>,
  updateItem?: (updatedItem: T, idField?: keyof T) => void,
  removeItem?: (itemId: string | number, idField?: keyof T) => void,
  fetchForEdit?: (id: string | number) => Promise<T>,
  idField?: keyof T,
) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<T | null>(null)
  const [deletingItemId, setDeletingItemId] = useState<string | number | null>(null)
  const [loadingEditId, setLoadingEditId] = useState<string | number | null>(null)

  const { showSuccess, showError, confirmDelete } = useToast()

  const handleDelete = async (item: T, idFieldArg: keyof T) => {
    const itemId = item[idFieldArg] as string | number
    const confirmed = await confirmDelete(
      `¿Estás seguro de que deseas eliminar este ${entityName}?`,
      `Eliminar ${entityName}`
    )

    if (!confirmed) return

    try {
      setDeletingItemId(itemId)
      // Pasar la fila completa: los documentos versionados toman item.version
      // para el bloqueo optimista del DELETE.
      await onDelete(itemId, item)
      if (removeItem) removeItem(itemId, idFieldArg)
      showSuccess(`${entityName} eliminado exitosamente`, 'Eliminación exitosa')
    } catch (error) {
      const { message } = extractErrorInfo(error)
      showError(message || `Error al eliminar ${entityName}`, 'Error')
      console.error(`Error deleting ${entityName}:`, error)
    } finally {
      setDeletingItemId(null)
    }
  }

  const handleEdit = async (item: T) => {
    if (fetchForEdit && idField) {
      const id = item[idField] as string | number
      setLoadingEditId(id)
      try {
        const fullItem = await fetchForEdit(id)
        setSelectedItem(fullItem)
        setIsEditModalOpen(true)
      } catch (error) {
        const { message } = extractErrorInfo(error)
        showError(message || `Error al cargar ${entityName}`, 'Error')
      } finally {
        setLoadingEditId(null)
      }
    } else {
      setSelectedItem(item)
      setIsEditModalOpen(true)
    }
  }

  const handleEditSuccess = (updatedItem: T, idFieldArg: keyof T) => {
    if (updateItem) updateItem(updatedItem, idFieldArg)
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
    loadingEditId,
    handleDelete,
    handleEdit,
    handleEditSuccess,
    closeEditModal
  }
}
