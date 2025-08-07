// INTERFAZ  OBTIENIDA DE RETURN DE "useModalState.ts"

import { I_Product } from '@/common/types/modules/product'

export interface ModalState {
	// Dialog state
	isDialogOpen: boolean
	currentRecord: Partial<I_Product> | null
	openCreateDialog: () => void
	openEditDialog: (product: I_Product) => void
	closeDialog: () => void

	// Hard delete modal state
	isHardDeleteModalOpen: boolean
	recordToHardDelete: I_Product | null
	isHardDeleting: boolean
	setIsHardDeleting: (value: boolean) => void
	openHardDeleteModal: (product: I_Product) => void
	closeHardDeleteModal: () => void
}
