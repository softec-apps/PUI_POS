'use client'

import { ModalState } from '@/modules/template/types/modalState'
import { HardDeleteModal } from '@/modules/template/components/organisms/Modal/ModalHardDelete'
import { TemplateFormModal } from '@/modules/template/components/organisms/Modal/ModalTemplateForm'

interface Props {
	modalState: ModalState
	templateHandlers: any
}

export function TemplateModals({ modalState, templateHandlers }: Props) {
	return (
		<>
			<TemplateFormModal
				isOpen={modalState.isDialogOpen}
				currentTemplate={modalState.currentRecord}
				onClose={templateHandlers.handleDialogClose}
				onSubmit={templateHandlers.handleFormSubmit}
			/>

			<HardDeleteModal
				isOpen={modalState.isHardDeleteModalOpen}
				template={modalState.templateToHardDelete}
				isAction={modalState.isHardDeleting}
				onClose={modalState.closeHardDeleteModal}
				onConfirm={templateHandlers.handleConfirmHardDelete}
			/>
		</>
	)
}
