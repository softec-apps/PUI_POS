import { useCallback } from 'react'

interface GenericModalState<T> {
	isDialogOpen: boolean
	currentRecord: T | null
	isHardDeleteModalOpen: boolean
	recordToHardDelete: T | null
	isHardDeleting: boolean
	setIsHardDeleting: (value: boolean) => void
	openCreateDialog: () => void
	openEditDialog: (record: T) => void
	closeDialog: () => void
	openHardDeleteModal: (record: T) => void
	closeHardDeleteModal: () => void
}

interface GenericHandlersProps<T> {
	modalState: GenericModalState<T>
	// Funciones del useGenericApi
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	create: (data: any) => Promise<void>
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	update: (id: string, data: any) => Promise<void>
	hardDelete: (id: string) => Promise<void>
	// Estados de loading del useGenericApi
	isCreating?: boolean
	isUpdating?: boolean
	isHardDeleting?: boolean
	// Funciones opcionales
	clearPreview?: () => void
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	transformFormData?: (data: any, isEdit: boolean) => any
}

export function useGenericHandlers<T extends { id: string }>({
	modalState,
	create,
	update,
	hardDelete,
	isCreating = false,
	isUpdating = false,
	isHardDeleting = false,
	clearPreview,
	transformFormData,
}: GenericHandlersProps<T>) {
	const handleFormSubmit = useCallback(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		async (formData: any) => {
			try {
				const isEdit = !!modalState.currentRecord?.id
				const transformedData = transformFormData ? transformFormData(formData, isEdit) : formData

				if (isEdit) {
					await update(modalState.currentRecord!.id, transformedData)
				} else {
					await create(transformedData)
				}

				// El toast ya lo maneja useGenericApi automáticamente
				handleDialogClose()
			} catch (error) {
				console.error('Error en formulario:', error)
				// El error toast ya lo maneja useGenericApi automáticamente
				throw error
			}
		},
		[modalState.currentRecord?.id, update, create, transformFormData]
	)

	const handleDialogClose = useCallback(() => {
		modalState.closeDialog()
		clearPreview?.()
	}, [modalState, clearPreview])

	const handleEdit = useCallback((record: T) => modalState.openEditDialog(record), [modalState])

	const handleConfirmHardDelete = useCallback(async () => {
		if (!modalState.recordToHardDelete) return

		try {
			await hardDelete(modalState.recordToHardDelete.id)
			modalState.closeHardDeleteModal()
			// El toast ya lo maneja useGenericApi automáticamente
		} catch (error) {
			console.error('Error al eliminar:', error)
			// El error toast ya lo maneja useGenericApi automáticamente
		}
	}, [modalState, hardDelete])

	return {
		handleFormSubmit,
		handleDialogClose,
		handleEdit,
		handleConfirmHardDelete,
		// Estados de loading desde useGenericApi
		isFormSubmitting: isCreating || isUpdating,
		isCreating,
		isUpdating,
		isHardDeleting,
		clearPreview: clearPreview || (() => {}),
	}
}
