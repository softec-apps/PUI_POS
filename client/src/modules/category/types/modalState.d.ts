import { I_Category } from '@/common/types/modules/category'

export interface ModalState {
	// Dialog state
	isDialogOpen: boolean
	currentRecord: Partial<I_Category> | null
	openCreateDialog: () => void
	openEditDialog: (record: I_Category) => void
	closeDialog: () => void

	// Soft delete modal state
	isSoftDeleteModalOpen: boolean
	recordToSoftDelete: I_Category | null
	isSoftDeleting: boolean
	setIsSoftDeleting: (value: boolean) => void
	openSoftDeleteModal: (record: I_Category) => void
	closeSoftDeleteModal: () => void

	// Restore modal state
	isRestoreModalOpen: boolean
	recordToRestore: I_Category | null
	isRestoring: boolean
	setIsRestoring: (value: boolean) => void
	openRestoreModal: (record: I_Category) => void
	closeRestoreModal: () => void

	// Hard delete modal state
	isHardDeleteModalOpen: boolean
	recordToHardDelete: I_Category | null
	isHardDeleting: boolean
	setIsHardDeleting: (value: boolean) => void
	openHardDeleteModal: (record: I_Category) => void
	closeHardDeleteModal: () => void
}
