import { useCallback } from 'react'
import { ModalState } from '@/modules/template/types/modalState'
import { TemplateFormData } from '@/modules/template/types/template-form'
import { I_UpdateTemplate, I_CreateTemplate, I_Template } from '@/common/types/modules/template'

interface Props {
	modalState: ModalState
	clearPreview: () => void
	createTemplate: (data: I_CreateTemplate) => Promise<void>
	updateTemplate: (id: string, data: I_UpdateTemplate) => Promise<void>
	hardDeleteTemplate: (id: string) => Promise<void>
}

export function useHandlers({ modalState, clearPreview, createTemplate, updateTemplate, hardDeleteTemplate }: Props) {
	const handleFormSubmit = useCallback(
		async (data: TemplateFormData) => {
			try {
				const templateData = {
					name: data.name,
					description: data.description,
					categoryId: data.categoryId,
					atributeIds: data.atributeIds,
				}

				if (modalState.currentRecord?.id) {
					await updateTemplate(modalState.currentRecord.id, templateData)
				} else {
					await createTemplate(templateData)
				}

				modalState.closeDialog()
				clearPreview()
			} catch (error) {
				console.error('Save error:', error)
				throw error // Re-throw para que el form maneje el error
			}
		},
		[modalState, updateTemplate, createTemplate, clearPreview]
	)

	const handleDialogClose = useCallback(() => {
		modalState.closeDialog()
		clearPreview()
	}, [modalState, clearPreview])

	const handleClearPreview = useCallback(() => clearPreview(), [clearPreview])

	// Modal handlers
	const handleEdit = useCallback((template: I_Template) => modalState.openEditDialog(template), [modalState])

	const handleConfirmHardDelete = useCallback(async () => {
		if (!modalState.templateToHardDelete) return

		try {
			modalState.setIsHardDeleting(true)
			await hardDeleteTemplate(modalState.templateToHardDelete.id)
			modalState.closeHardDeleteModal()
		} catch (error) {
			console.error('Delete error:', error)
		} finally {
			modalState.setIsHardDeleting(false)
		}
	}, [modalState, hardDeleteTemplate])

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
