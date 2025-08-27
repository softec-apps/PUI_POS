import { I_Customer } from '@/common/types/modules/customer'

export interface ModalState {
	// Dialog state
	isDialogOpen: boolean
	currentRecord: Partial<I_Customer> | null
	openCreateDialog: () => void
	openEditDialog: (record: I_Customer) => void
	closeDialog: () => void

	// Soft delete modal state
	isSoftDeleteModalOpen: boolean
	recordToSoftDelete: I_Customer | null
	isSoftDeleting: boolean
	setIsSoftDeleting: (value: boolean) => void
	openSoftDeleteModal: (record: I_Customer) => void
	closeSoftDeleteModal: () => void

	// Restore modal state
	isRestoreModalOpen: boolean
	recordToRestore: I_Customer | null
	isRestoring: boolean
	setIsRestoring: (value: boolean) => void
	openRestoreModal: (record: I_Customer) => void
	closeRestoreModal: () => void

	// Hard delete modal state
	isHardDeleteModalOpen: boolean
	recordToHardDelete: I_Customer | null
	isHardDeleting: boolean
	setIsHardDeleting: (value: boolean) => void
	openHardDeleteModal: (record: I_Customer) => void
	closeHardDeleteModal: () => void
}
