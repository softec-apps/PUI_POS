// INTERFAZ  OBTIENIDA DE RETURN DE "useModalState.ts"

export interface ModalState {
	// Dialog state
	isDialogOpen: boolean
	currentRecord: Partial<Category_I> | null
	openCreateDialog: () => void
	openEditDialog: (category: Category_I) => void
	closeDialog: () => void

	// Soft delete modal state
	isSoftDeleteModalOpen: boolean
	categoryToDelete: Category_I | null
	isSoftDeleting: boolean
	setIsSoftDeleting: (value: boolean) => void
	openSoftDeleteModal: (category: Category_I) => void
	closeSoftDeleteModal: () => void

	// Restore modal state
	isRestoreModalOpen: boolean
	categoryToRestore: Category_I | null
	isRestoring: boolean
	setIsRestoring: (value: boolean) => void
	openRestoreModal: (category: Category_I) => void
	closeRestoreModal: () => void

	// Hard delete modal state
	isHardDeleteModalOpen: boolean
	categoryToHardDelete: Category_I | null
	isHardDeleting: boolean
	setIsHardDeleting: (value: boolean) => void
	openHardDeleteModal: (category: Category_I) => void
	closeHardDeleteModal: () => void
}
