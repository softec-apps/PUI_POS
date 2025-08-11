import { useCallback } from 'react'
import { ModalState } from '@/modules/user/types/modalState'
import { UserFormData } from '@/modules/user/types/user-form'
import { I_UpdateUser, I_CreateUser, I_User } from '@/common/types/modules/user'

interface useHandlersProps {
	modalState: ModalState
	createRecord: (data: I_CreateUser) => Promise<void>
	updateRecord: (id: string, data: I_UpdateUser) => Promise<void>
	softDeleteRecord: (id: string) => Promise<void>
	hardDeleteRecord: (id: string) => Promise<void>
}

export function useHandlers({
	modalState,
	createRecord,
	updateRecord,
	softDeleteRecord,
	hardDeleteRecord,
}: useHandlersProps) {
	const handleFormSubmit = useCallback(
		async (data: UserFormData) => {
			try {
				const { roleId, statusId, ...rest } = data
				const recordData: I_CreateUser = {
					...rest,
					role: { id: parseInt(roleId, 10) },
					status: { id: parseInt(statusId, 10) },
					photo: data.photo ? { id: data.photo } : '',
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
	const handleEdit = useCallback((record: I_User) => modalState.openEditDialog(record), [modalState])

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

	const handleConfirmSoftDelete = useCallback(async () => {
		if (!modalState.recordToSoftDelete) return

		try {
			modalState.setIsSoftDeleting(true)
			await softDeleteRecord(modalState.recordToSoftDelete.id)
			modalState.closeSoftDeleteModal()
		} catch (error) {
			console.error('Delete error:', error)
		} finally {
			modalState.setIsSoftDeleting(false)
		}
	}, [modalState, softDeleteRecord])

	return {
		// Form handlers actualizados
		handleFormSubmit,
		handleDialogClose,

		// Modal handlers
		handleEdit,

		// Confirmation handlers
		handleConfirmHardDelete,
		handleConfirmSoftDelete,
	}
}
