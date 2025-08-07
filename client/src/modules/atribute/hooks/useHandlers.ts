import { useCallback } from 'react'
import { ModalState } from '@/modules/atribute/types/modalState'
import { AttributeFormData } from '@/modules/atribute/components/organisms/Modal/ModalAttributeForm'
import { I_Attribute, I_CreateAttribute, I_UpdateAttribute } from '@/common/types/modules/attribute'

interface Props {
	modalState: ModalState
	clearPreview: () => void
	createAttribute: (data: I_CreateAttribute) => Promise<void>
	updateAttribute: (id: string, data: I_UpdateAttribute) => Promise<void>
	hardDeleteAttribute: (id: string) => Promise<void>
}

export function useAttributeHandlers({
	modalState,
	clearPreview,
	createAttribute,
	updateAttribute,
	hardDeleteAttribute,
}: Props) {
	// Form handlers para el nuevo modal con react-hook-form
	const handleFormSubmit = useCallback(
		async (data: AttributeFormData) => {
			try {
				const atributeData = {
					name: data.name.trim(),
					type: data.type,
					options: data.options || null,
					required: data.required || false,
				}

				if (modalState.currentRecord?.id) {
					await updateAttribute(modalState.currentRecord.id, atributeData)
				} else {
					await createAttribute(atributeData)
				}

				modalState.closeDialog()
				clearPreview()
			} catch (error) {
				console.error('Save error:', error)
				throw error // Re-throw para que el form maneje el error
			}
		},
		[modalState, updateAttribute, createAttribute, clearPreview]
	)

	const handleDialogClose = useCallback(() => {
		modalState.closeDialog()
		clearPreview()
	}, [modalState, clearPreview])

	const handleClearPreview = useCallback(() => clearPreview(), [clearPreview])

	// Modal handlers
	const handleEdit = useCallback((atribute: I_Attribute) => modalState.openEditDialog(atribute), [modalState])

	const handleConfirmHardDelete = useCallback(async () => {
		if (!modalState.attributeToHardDelete) return

		try {
			modalState.setIsHardDeleting(true)
			await hardDeleteAttribute(modalState.attributeToHardDelete.id)
			modalState.closeHardDeleteModal()
		} catch (error) {
			console.error('Delete error:', error)
		} finally {
			modalState.setIsHardDeleting(false)
		}
	}, [modalState, hardDeleteAttribute])

	return {
		// Form handlers actualizados
		handleFormSubmit,
		handleDialogClose,
		handleClearPreview,

		// Modal handlers
		handleEdit,

		// Confirmation handlers
		handleConfirmHardDelete,
	}
}
