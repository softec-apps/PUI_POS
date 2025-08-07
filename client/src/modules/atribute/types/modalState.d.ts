// INTERFAZ  OBTIENIDA DE RETURN DE "useModalState.ts"a
import { I_Attribute } from '@/common/types/modules/attribute'

export interface ModalState {
	// Dialog state
	isDialogOpen: boolean
	currentRecord: Partial<I_Attribute> | null
	openCreateDialog: () => void
	openEditDialog: (attribute: I_Attribute) => void
	closeDialog: () => void

	// Hard delete modal state
	isHardDeleteModalOpen: boolean
	attributeToHardDelete: I_Attribute | null
	isHardDeleting: boolean
	setIsHardDeleting: (value: boolean) => void
	openHardDeleteModal: (attribute: I_Attribute) => void
	closeHardDeleteModal: () => void
}
