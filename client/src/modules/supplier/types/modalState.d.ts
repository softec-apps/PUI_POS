import { I_Supplier } from '@/common/types/modules/supplier'

export interface ModalState {
	// Dialog state
	isDialogOpen: boolean
	currentRecord: Partial<I_Supplier> | null
	openCreateDialog: () => void
	openEditDialog: (record: I_Supplier) => void
	closeDialog: () => void

	// Soft delete modal state
	isSoftDeleteModalOpen: boolean
	recordToSoftDelete: I_Supplier | null
	isSoftDeleting: boolean
	setIsSoftDeleting: (value: boolean) => void
	openSoftDeleteModal: (record: I_Supplier) => void
	closeSoftDeleteModal: () => void

	// Restore modal state
	isRestoreModalOpen: boolean
	recordToRestore: I_Supplier | null
	isRestoring: boolean
	setIsRestoring: (value: boolean) => void
	openRestoreModal: (record: I_Supplier) => void
	closeRestoreModal: () => void

	// Hard delete modal state
	isHardDeleteModalOpen: boolean
	recordToHardDelete: I_Supplier | null
	isHardDeleting: boolean
	setIsHardDeleting: (value: boolean) => void
	openHardDeleteModal: (record: I_Supplier) => void
	closeHardDeleteModal: () => void
}
