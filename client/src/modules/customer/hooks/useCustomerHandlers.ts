import { useCallback } from 'react'
import { ModalState } from '@/modules/customer/types/modalState'
import { CustomerFormData } from '@/modules/customer/components/organisms/Modal/ModalCustomerForm'
import { I_Customer, I_CreateCustomer, I_UpdateCustomer } from '@/common/types/modules/customer'

interface UseCustomerHandlersProps {
	modalState: ModalState
	createRecord: (data: I_CreateCustomer) => Promise<void>
	updateRecord: (id: string, data: I_UpdateCustomer) => Promise<void>
	hardDeleteRecord: (id: string) => Promise<void>
}

export function useCustomerHandlers({
	modalState,
	createRecord,
	updateRecord,
	hardDeleteRecord,
}: UseCustomerHandlersProps) {

	const handleFormSubmit = useCallback(
		async (data: CustomerFormData) => {
			try {
				const customerData: I_CreateCustomer = { ...data } // Assuming CustomerFormData is compatible

				if (modalState.currentRecord?.id) {
					await updateRecord(modalState.currentRecord.id, customerData)
				} else {
					await createRecord(customerData)
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

	const handleEdit = useCallback((customer: I_Customer) => modalState.openEditDialog(customer), [modalState])

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
		handleFormSubmit,
		handleDialogClose,
		handleEdit,
		handleConfirmHardDelete,
	}
}

export type CustomerHandlers = ReturnType<typeof useCustomerHandlers>
