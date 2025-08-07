import { useCallback } from 'react'
import { ModalState } from '@/modules/supplier/types/modalState'
import { supplierFormData } from '@/modules/supplier/components/organisms/Modal/ModalForm'
import { I_Supplier, I_CreateSupplier, I_UpdateSupplier } from '@/common/types/modules/supplier'

interface Props {
	modalState: ModalState
	createRecord: (data: I_CreateSupplier) => Promise<void>
	updateRecord: (id: string, data: I_UpdateSupplier) => Promise<void>
	hardDeleteRecord: (id: string) => Promise<void>
}

export function useSupplierHandlers({ modalState, createRecord, updateRecord, hardDeleteRecord }: Props) {
	// Form handlers para el nuevo modal con react-hook-form
	const handleFormSubmit = useCallback(
		async (data: supplierFormData) => {
			try {
				const newRecord = {
					ruc: data.ruc,
					legalName: data.legalName,
					commercialName: data.commercialName,
				}

				if (modalState.currentRecord?.id) {
					await updateRecord(modalState.currentRecord.id, newRecord)
				} else {
					await createRecord(newRecord)
				}

				modalState.closeDialog()
			} catch (error) {
				console.error('Save error:', error)
				throw error // Re-throw para que el form maneje el error
			}
		},
		[modalState, updateRecord, createRecord]
	)

	const handleDialogClose = useCallback(() => {
		modalState.closeDialog()
	}, [modalState])

	// Modal handlers
	const handleEdit = useCallback((record: I_Supplier) => modalState.openEditDialog(record), [modalState])

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
