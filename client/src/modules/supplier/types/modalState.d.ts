// INTERFAZ  OBTIENIDA DE RETURN DE "useModalState.ts"
import { I_Supplier } from '@/common/types/modules/supplier'

export interface ModalState {
	// Dialog state
	isDialogOpen: boolean
	currentRecord: Partial<I_Supplier> | null
	openCreateDialog: () => void
	openEditDialog: (record: I_Supplier) => void
	closeDialog: () => void

	// Hard delete modal state
	isHardDeleteModalOpen: boolean
	recordToHardDelete: I_Supplier | null
	isHardDeleting: boolean
	setIsHardDeleting: (value: boolean) => void
	openHardDeleteModal: (record: I_Supplier) => void
	closeHardDeleteModal: () => void
}
