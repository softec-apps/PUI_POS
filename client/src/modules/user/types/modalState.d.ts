import { I_User } from '@/common/types/modules/user'

export interface ModalState {
	// Dialog state
	isDialogOpen: boolean
	currentRecord: Partial<I_User> | null
	openCreateDialog: () => void
	openEditDialog: (record: I_User) => void
	closeDialog: () => void

	// Soft delete modal state
	isSoftDeleteModalOpen: boolean
	recordToSoftDelete: I_User | null
	isSoftDeleting: boolean
	setIsSoftDeleting: (value: boolean) => void
	openSoftDeleteModal: (record: I_User) => void
	closeSoftDeleteModal: () => void

	// Restore modal state
	isRestoreModalOpen: boolean
	recordToRestore: I_User | null
	isRestoring: boolean
	setIsRestoring: (value: boolean) => void
	openRestoreModal: (record: I_User) => void
	closeRestoreModal: () => void

	// Hard delete modal state
	isHardDeleteModalOpen: boolean
	recordToHardDelete: I_User | null
	isHardDeleting: boolean
	setIsHardDeleting: (value: boolean) => void
	openHardDeleteModal: (record: I_User) => void
	closeHardDeleteModal: () => void
}
