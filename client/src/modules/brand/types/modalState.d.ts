// INTERFAZ OBTENIDA DE RETURN DE "useModalState.ts"

export interface ModalState {
	// Dialog state - CAMBIO: usar I_Brand en lugar de Partial<Brand_I>
	isDialogOpen: boolean
	currentRecord: I_Brand | null  // <- CAMBIO AQUÍ
	openCreateDialog: () => void
	openEditDialog: (brand: I_Brand) => void
	closeDialog: () => void

	// Soft delete modal state
	isSoftDeleteModalOpen: boolean
	brandToDelete: I_Brand | null
	isSoftDeleting: boolean
	setIsSoftDeleting: (value: boolean) => void
	openSoftDeleteModal: (brand: I_Brand) => void
	closeSoftDeleteModal: () => void

	// Restore modal state
	isRestoreModalOpen: boolean
	brandToRestore: I_Brand | null
	isRestoring: boolean
	setIsRestoring: (value: boolean) => void
	openRestoreModal: (brand: I_Brand) => void
	closeRestoreModal: () => void

	// Hard delete modal state
	isHardDeleteModalOpen: boolean
	brandToHardDelete: I_Brand | null
	isHardDeleting: boolean
	setIsHardDeleting: (value: boolean) => void
	openHardDeleteModal: (brand: I_Brand) => void
	closeHardDeleteModal: () => void
}