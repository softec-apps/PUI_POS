import { useCallback } from 'react'
import { ModalState } from '@/modules/product/types/modalState'
import { ProductFormData } from '@/modules/product/types/product-form'
import { I_UpdateProduct, I_CreateProduct, I_Product } from '@/common/types/modules/product'

interface Props {
	modalState: ModalState
	createRecord: (data: I_CreateProduct) => Promise<void>
	updateRecord: (id: string, data: I_UpdateProduct) => Promise<void>
	hardDeleteRecord: (id: string) => Promise<void>
}

export function useHandlers({ modalState, createRecord, updateRecord, hardDeleteRecord }: Props) {
	const handleFormSubmit = useCallback(
		async (data: ProductFormData) => {
			try {
				const recordData: I_CreateProduct = {
					...data,
					photo: data.photo ? { id: data.photo } : null,
				}

				if (modalState.currentRecord?.id) {
					await updateRecord(modalState.currentRecord.id, recordData)
				} else {
					await createRecord(recordData)
				}
				modalState.closeDialog()
			} catch (error) {
				console.error('Save error:', error)
				throw error
			}
		},
		[modalState, updateRecord, createRecord]
	)

	const handleDialogClose = useCallback(() => {
		modalState.closeDialog()
	}, [modalState])

	// Modal handlers
	const handleEdit = useCallback((record: I_Product) => modalState.openEditDialog(record), [modalState])

	const handleConfirmHardDelete = useCallback(async () => {
		if (!modalState.recordToHardDelete) return

		try {
			modalState.setIsHardDeleting(true)
			await hardDeleteRecord(modalState.recordToHardDelete.id)
			modalState.closeHardDeleteModal()
		} catch (error) {
			console.error('Delete error:', error)
		} finally {
			modalState.setIsHardDeleting(false)
		}
	}, [modalState, hardDeleteRecord])

	return {
		// Form handlers actualizados
		handleFormSubmit,
		handleDialogClose,

		// Modal handlers
		handleEdit,

		// Confirmation handlers
		handleConfirmHardDelete,
	}
}
