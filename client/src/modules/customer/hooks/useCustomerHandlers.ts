/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from 'react'
import { ModalState } from '@/modules/customer/types/modalState'
import { CategoryFormData } from '@/modules/category/components/organisms/Modal/ModalCategoryForm'
import { I_Customer, I_CreateCustomer, I_UpdateCustomer } from '@/common/types/modules/customer'

interface UseCustomerHandlersProps {
	modalState: ModalState
	clearPreview: () => void
	createCategory: (data: I_CreateCustomer) => Promise<void>
	updateCategory: (id: string, data: I_UpdateCustomer) => Promise<void>
	hardDeleteCategory: (id: string) => Promise<void>
}

export function useCustomerHandlers({
	modalState,
	clearPreview,
	createCategory,
	updateCategory,
	hardDeleteCategory,
}: UseCustomerHandlersProps) {
	// Form handlers para el nuevo modal con react-hook-form
	const handleFormSubmit = useCallback(
		async (data: CategoryFormData) => {
			try {
				const categoryData: any = {
					name: data.name.trim(),
					description: data.description?.trim() || null,
				}

				if (modalState.currentRecord?.id) {
					await updateCategory(modalState.currentRecord.id, categoryData)
				} else {
					await createCategory(categoryData)
				}

				modalState.closeDialog()
				clearPreview()
			} catch (error) {
				console.error('Save error:', error)
				throw error
			}
		},
		[modalState, updateCategory, createCategory, clearPreview]
	)

	const handleDialogClose = useCallback(() => {
		modalState.closeDialog()
		clearPreview()
	}, [modalState, clearPreview])

	const handleClearPreview = useCallback(() => clearPreview(), [clearPreview])

	// Modal handlers
	const handleEdit = useCallback((category: I_Customer) => modalState.openEditDialog(category), [modalState])

	const handleConfirmHardDelete = useCallback(async () => {
		if (!modalState.recordToHardDelete) return

		try {
			modalState.setIsHardDeleting(true)
			await hardDeleteCategory(modalState.recordToHardDelete.id)
			modalState.closeHardDeleteModal()
		} catch (error) {
			console.error('Delete error:', error)
		} finally {
			modalState.setIsHardDeleting(false)
		}
	}, [modalState, hardDeleteCategory])

	return {
		handleFormSubmit,
		handleDialogClose,
		handleClearPreview,
		handleEdit,
		handleConfirmHardDelete,
	}
}
