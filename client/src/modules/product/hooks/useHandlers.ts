import { useCallback } from 'react'
import { toast } from 'sonner'
import { I_Product, I_CreateProduct, I_UpdateProduct } from '@/modules/product/types/product'
import { ModalState } from '@/modules/product/types/modalState'

interface UseProductHandlersProps {
  modalState: ModalState
  createRecord: (data: I_CreateProduct) => Promise<I_Product>
  updateRecord: (id: string, data: I_UpdateProduct) => Promise<I_Product>
  hardDeleteRecord: (id: string) => Promise<void>
}

export const useProductHandlers = ({
  modalState,
  createRecord,
  updateRecord,
  hardDeleteRecord,
}: UseProductHandlersProps) => {
  const handleDialogClose = useCallback(() => {
    modalState.closeDialog()
  }, [modalState])

  const handleFormSubmit = useCallback(
    async (data: I_CreateProduct | I_UpdateProduct) => {
      try {
        if (modalState.currentRecord) {
          await updateRecord(modalState.currentRecord.id, data as I_UpdateProduct)
          toast.success('Producto actualizado con éxito')
        } else {
          await createRecord(data as I_CreateProduct)
          toast.success('Producto creado con éxito')
        }
        modalState.closeDialog()
      } catch (error) {
        console.error('Error al procesar el formulario:', error)
        toast.error('Ocurrió un error al procesar el formulario')
      }
    },
    [modalState, createRecord, updateRecord]
  )

  const handleEdit = useCallback(
    (record: I_Product) => {
      modalState.openEditDialog(record)
    },
    [modalState]
  )

  const handleConfirmHardDelete = useCallback(async () => {
    if (modalState.recordToHardDelete) {
      try {
        await hardDeleteRecord(modalState.recordToHardDelete.id)
        toast.success('Producto eliminado permanentemente')
      } catch (error) {
        console.error('Error al eliminar permanentemente:', error)
        toast.error('Error al eliminar el producto')
      } finally {
        modalState.closeHardDeleteModal()
      }
    }
  }, [modalState, hardDeleteRecord])

  return {
    handleDialogClose,
    handleFormSubmit,
    handleEdit,
    handleConfirmHardDelete,
  }
}
