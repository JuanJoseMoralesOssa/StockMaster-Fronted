// // Ejemplo de refactorización de PurchasesTable usando el nuevo sistema de toasts
// import { useState } from 'react'
// import { useCrudToast, useToast } from '../../../hooks/useToast'
// import { NotificationFactory } from '../../../services/ToastService'
// import { purchaseService } from '../../../services/PurchaseService'
// import Purchase from '../../../types/Purchase'

// // Esta es una versión refactorizada simplificada para mostrar el patrón
// export const RefactoredPurchasesTable = () => {
//     const [selectedPurchase, setSelectedPurchase] = useState<Purchase>({} as Purchase)
//     const [isLoading, setIsLoading] = useState(false)

//     const { handleDelete, handleUpdate } = useCrudToast()
//     const { showError, showLoading, close } = useToast()

//     // Método refactorizado para eliminar compras
//     const handleDeletePurchase = async (id: number) => {
//         const result = await handleDelete(async () => {
//             await purchaseService.delete(id)
//             await purchaseService.deleteWithDetails(id)
//             return true
//         }, 'Compra')

//         if (result) {
//             // refresh() // Refrescar datos después de eliminar
//         }
//     }

//     // Método refactorizado para editar compras con validaciones específicas
//     const handleEditPurchase = async () => {
//         setIsLoading(true)

//         try {
//             // Validaciones específicas usando el NotificationFactory
//             if (!selectedPurchase.id) {
//                 NotificationFactory.purchase.missingId()
//                 setIsLoading(false)
//                 return
//             }

//             if (!selectedPurchase.date) {
//                 NotificationFactory.purchase.missingDate()
//                 setIsLoading(false)
//                 return
//             }

//             // Validar detalles de compra
//             for (const detail of selectedPurchase.purchase_details ?? []) {
//                 if (detail.toDelete) continue
//                 if (!detail.productId || !detail.personId) {
//                     NotificationFactory.purchase.invalidDetails()
//                     setIsLoading(false)
//                     return
//                 }
//             }

//             const result = await handleUpdate(async () => {
//                 return await purchaseService.updateWithDetails(selectedPurchase)
//             }, 'Compra')

//             if (result?.total_kg) {
//                 selectedPurchase.total_kg = result.total_kg ?? 0
//                 // Actualizar estado según sea necesario
//             }

//         } catch (error) {
//             // El hook ya maneja el error, pero podemos agregar lógica específica si es necesario
//             console.error('Error específico en la compra:', error)
//         } finally {
//             setIsLoading(false)
//         }
//     }

//     // Ejemplo de operación compleja con loading personalizado
//     const handleComplexOperation = async () => {
//         showLoading('Procesando compra compleja...')

//         try {
//             // Simulación de operación compleja
//             await new Promise(resolve => setTimeout(resolve, 2000))

//             // Múltiples operaciones
//             await purchaseService.someComplexOperation()

//             close() // Cerrar loading
//             NotificationFactory.purchase.updated()

//         } catch (error) {
//             close() // Cerrar loading
//             const errorMessage = error instanceof Error ? error.message : 'Error en operación compleja'
//             showError(errorMessage)
//         }
//     }

//     return (
//         <div>
//             {/* Tu JSX aquí */}
//             <button onClick={() => handleDeletePurchase(1)}>
//                 Eliminar Compra
//             </button>
//             <button onClick={handleEditPurchase} disabled={isLoading}>
//                 {isLoading ? 'Editando...' : 'Editar Compra'}
//             </button>
//             <button onClick={handleComplexOperation}>
//                 Operación Compleja
//             </button>
//         </div>
//     )
// }

// // Ejemplo de uso en un hook personalizado para compras
// export const usePurchaseOperations = () => {
//     const { handleCreate, handleUpdate, handleDelete } = useCrudToast()
//     const { showLoading, close, showError } = useToast()

//     const createPurchaseWithDetails = async (purchaseData: Purchase) => {
//         return await handleCreate(async () => {
//             // Validaciones específicas
//             if (!purchaseData.date) {
//                 throw new Error('La fecha de compra es requerida')
//             }

//             if (!purchaseData.purchase_details?.length) {
//                 throw new Error('Debe agregar al menos un detalle de compra')
//             }

//             return await purchaseService.createWithDetails(purchaseData)
//         }, 'Compra')
//     }

//     const updatePurchaseWithValidation = async (purchaseData: Purchase) => {
//         // Loading personalizado para operaciones complejas
//         showLoading('Validando y actualizando compra...')

//         try {
//             // Validaciones complejas
//             const validationResult = await purchaseService.validatePurchase(purchaseData)

//             if (!validationResult.isValid) {
//                 close()
//                 showError(`Validación fallida: ${validationResult.errors.join(', ')}`)
//                 return null
//             }

//             close() // Cerrar loading de validación

//             // Usar el sistema de toast para la actualización
//             return await handleUpdate(async () => {
//                 return await purchaseService.updateWithDetails(purchaseData)
//             }, 'Compra')

//         } catch (error) {
//             close()
//             const message = error instanceof Error ? error.message : 'Error en validación'
//             showError(message)
//             return null
//         }
//     }

//     const deletePurchaseWithConfirmation = async (id: number, purchaseName?: string) => {
//         return await handleDelete(async () => {
//             await purchaseService.delete(id)
//             await purchaseService.deleteWithDetails(id)
//             return true
//         }, 'Compra', purchaseName ? `¿Eliminar la compra "${purchaseName}"?` : undefined)
//     }

//     return {
//         createPurchaseWithDetails,
//         updatePurchaseWithValidation,
//         deletePurchaseWithConfirmation,
//     }
// }
