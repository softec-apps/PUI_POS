import { useCallback } from 'react'
import { useModalState } from './useModalState'
import { I_Sale, I_CreateSale, I_UpdateSale } from '@/common/types/modules/sale'

// I will define this more specifically when creating the form
type SaleFormData = any;

interface UseSaleHandlersProps {
	modalState: ReturnType<typeof useModalState>
	createSale: (data: I_CreateSale) => Promise<void>
	updateSale: (id: string, data: I_UpdateSale) => Promise<void>
	hardDeleteSale: (id: string) => Promise<void>
}

export function useSaleHandlers({
	modalState,
	createSale,
	updateSale,
	hardDeleteSale,
}: UseSaleHandlersProps) {
	const handleFormSubmit = useCallback(
		async (data: SaleFormData) => {
			try {
				const saleData: any = {
					// Map your form data to the I_CreateSale or I_UpdateSale structure
					// This is just a placeholder
					...data,
				}

				if (modalState.currentRecord?.id) {
					await updateSale(modalState.currentRecord.id, saleData)
				} else {
					await createSale(saleData)
				}

				modalState.closeDialog()
			} catch (error) {
				console.error('Save error:', error)
				throw error
			}
		},
		[modalState, updateSale, createSale]
	)

	const handleDialogClose = useCallback(() => {
		modalState.closeDialog()
	}, [modalState])

	const handleEdit = useCallback(
		(sale: I_Sale) => {
			modalState.openEditDialog(sale)
		},
		[modalState]
	)

	const handleConfirmHardDelete = useCallback(async () => {
		if (!modalState.saleToHardDelete) return

		try {
			modalState.setIsHardDeleting(true)
			await hardDeleteSale(modalState.saleToHardDelete.id)
			modalState.closeHardDeleteModal()
		} catch (error) {
			console.error('Delete error:', error)
		} finally {
			modalState.setIsHardDeleting(false)
		}
	}, [modalState, hardDeleteSale])

	return {
		handleFormSubmit,
		handleDialogClose,
		handleEdit,
		handleConfirmHardDelete,
	}
}
