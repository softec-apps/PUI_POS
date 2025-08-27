import { I_Brand } from '@/common/types/modules/brand'

export interface ModalState {
	// Dialog state
	isDialogOpen: boolean
	currentRecord: Partial<I_Brand> | null
	openCreateDialog: () => void
	openEditDialog: (record: I_Brand) => void
	closeDialog: () => void

	// Soft delete modal state
	isSoftDeleteModalOpen: boolean
	recordToSoftDelete: I_Brand | null
	isSoftDeleting: boolean
	setIsSoftDeleting: (value: boolean) => void
	openSoftDeleteModal: (record: I_Brand) => void
	closeSoftDeleteModal: () => void

	// Restore modal state
	isRestoreModalOpen: boolean
	recordToRestore: I_Brand | null
	isRestoring: boolean
	setIsRestoring: (value: boolean) => void
	openRestoreModal: (record: I_Brand) => void
	closeRestoreModal: () => void

	// Hard delete modal state
	isHardDeleteModalOpen: boolean
	recordToHardDelete: I_Brand | null
	isHardDeleting: boolean
	setIsHardDeleting: (value: boolean) => void
	openHardDeleteModal: (record: I_Brand) => void
	closeHardDeleteModal: () => void
}
