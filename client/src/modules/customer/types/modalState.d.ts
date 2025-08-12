import { I_Customer } from '@/common/types/modules/customer'

export interface ModalState {
	// Dialog state
	isDialogOpen: boolean
	currentRecord: Partial<I_Customer> | null
	openCreateDialog: () => void
	openEditDialog: (record: I_Customer) => void
	closeDialog: () => void

	// Hard delete modal state
	isHardDeleteModalOpen: boolean
	recordToHardDelete: I_Customer | null
	isHardDeleting: boolean
	setIsHardDeleting: (value: boolean) => void
	openHardDeleteModal: (record: I_Customer) => void
	closeHardDeleteModal: () => void
}
