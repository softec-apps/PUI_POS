// INTERFAZ  OBTIENIDA DE RETURN DE "useModalState.ts"

import { I_Template } from '@/common/types/modules/template'

export interface ModalState {
	// Dialog state
	isDialogOpen: boolean
	currentRecord: Partial<I_Template> | null
	openCreateDialog: () => void
	openEditDialog: (template: I_Template) => void
	closeDialog: () => void

	// Hard delete modal state
	isHardDeleteModalOpen: boolean
	templateToHardDelete: I_Template | null
	isHardDeleting: boolean
	setIsHardDeleting: (value: boolean) => void
	openHardDeleteModal: (template: I_Template) => void
	closeHardDeleteModal: () => void
}
