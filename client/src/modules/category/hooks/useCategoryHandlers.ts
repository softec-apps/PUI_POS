import { useCallback } from 'react'
import { ModalState } from '@/modules/category/types/modalState'
import { CategoryFormData } from '@/modules/category/components/organisms/Modal/ModalCategoryForm'
import { I_Category, I_CreateCategory, I_UpdateCategory } from '@/common/types/modules/category'

interface UseCategoryHandlersProps {
	modalState: ModalState
	clearPreview: () => void
	setPreviewImage: (image: string | null) => void
	uploadFile: (file: File) => Promise<string | null>
	createCategory: (data: I_CreateCategory) => Promise<void>
	updateCategory: (id: string, data: I_UpdateCategory) => Promise<void>
	restoreCategory: (id: string) => Promise<void>
	softDeleteCategory: (id: string) => Promise<void>
	hardDeleteCategory: (id: string) => Promise<void>
}

export function useCategoryHandlers({
	modalState,
	clearPreview,
	setPreviewImage,
	uploadFile,
	createCategory,
	updateCategory,
	softDeleteCategory,
	restoreCategory,
	hardDeleteCategory,
}: UseCategoryHandlersProps) {
	// Form handlers para el nuevo modal con react-hook-form
	const handleFormSubmit = useCallback(
		async (data: CategoryFormData) => {
			try {
				const categoryData: any = {
					name: data.name.trim(),
					description: data.description?.trim() || null,
				}

				// Manejar la lógica de la foto
				if (data.removePhoto) {
					// Si se marcó para remover, enviar null o undefined
					categoryData.photo = null
				} else if (data.photo) {
					// Si hay una nueva foto, enviarla
					categoryData.photo = { id: data.photo }
				}
				// Si no hay removePhoto ni photo nueva, no tocar el campo photo
				if (modalState.currentRecord?.id) {
					await updateCategory(modalState.currentRecord.id, categoryData)
				} else {
					await createCategory(categoryData)
				}

				modalState.closeDialog()
				clearPreview()
			} catch (error) {
				console.error('Save error:', error)
				throw error // Re-throw para que el form maneje el error
			}
		},
		[modalState, updateCategory, createCategory, clearPreview]
	)

	const handleFileChange = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0]
			if (!file) return null

			try {
				const fileId = await uploadFile(file)
				return fileId // Devolver el ID para que el modal lo capture
			} catch (error) {
				console.error('Error uploading file:', error)
				return null
			}
		},
		[uploadFile]
	)

	const handleDialogClose = useCallback(() => {
		modalState.closeDialog()
		clearPreview()
	}, [modalState, clearPreview])

	const handleClearPreview = useCallback(() => clearPreview(), [clearPreview])

	// Modal handlers
	const handleEdit = useCallback(
		(category: I_Category) => {
			modalState.openEditDialog(category)
			// react-hook-form se encargará de cargar los datos en el useEffect del modal
			if (category.photo?.id) {
				setPreviewImage(null) // Podrías cargar la URL real de la imagen aquí
			}
		},
		[modalState, setPreviewImage]
	)

	const handleRestore = useCallback((category: I_Category) => modalState.openRestoreModal(category), [modalState])

	// Status handlers (sin cambios)
	const handleStatusToggle = useCallback(
		async (category: I_Category) => {
			try {
				const newStatus = category.status === 'active' ? 'inactive' : 'active'
				await updateCategory(category.id, { status: newStatus })
			} catch (error) {
				console.error('Status toggle error:', error)
			}
		},
		[updateCategory]
	)

	const handleBulkStatusUpdate = useCallback(
		async (categoryIds: string[], newStatus: 'active' | 'inactive') => {
			try {
				const updatePromises = categoryIds.map(id => updateCategory(id, { status: newStatus }))
				await Promise.all(updatePromises)
			} catch (error) {
				console.error('Bulk status update error:', error)
			}
		},
		[updateCategory]
	)

	// Confirmation handlers (sin cambios)
	const handleConfirmSoftDelete = useCallback(async () => {
		if (!modalState.categoryToDelete) return

		try {
			modalState.setIsSoftDeleting(true)
			await softDeleteCategory(modalState.categoryToDelete.id)
			modalState.closeSoftDeleteModal()
		} catch (error) {
			console.error('Delete error:', error)
		} finally {
			modalState.setIsSoftDeleting(false)
		}
	}, [modalState, softDeleteCategory])

	const handleConfirmRestore = useCallback(async () => {
		if (!modalState.categoryToRestore) return

		try {
			modalState.setIsRestoring(true)
			await restoreCategory(modalState.categoryToRestore.id)
			modalState.closeRestoreModal()
		} catch (error) {
			console.error('Restore error:', error)
		} finally {
			modalState.setIsRestoring(false)
		}
	}, [modalState, restoreCategory])

	const handleConfirmHardDelete = useCallback(async () => {
		if (!modalState.categoryToHardDelete) return

		try {
			modalState.setIsHardDeleting(true)
			await hardDeleteCategory(modalState.categoryToHardDelete.id)
			modalState.closeHardDeleteModal()
		} catch (error) {
			console.error('Delete error:', error)
		} finally {
			modalState.setIsHardDeleting(false)
		}
	}, [modalState, hardDeleteCategory])

	return {
		// Form handlers actualizados
		handleFormSubmit,
		handleFileChange,
		handleDialogClose,
		handleClearPreview,

		// Modal handlers
		handleEdit,
		handleRestore,

		// Status handlers
		handleStatusToggle,
		handleBulkStatusUpdate,

		// Confirmation handlers
		handleConfirmRestore,
		handleConfirmSoftDelete,
		handleConfirmHardDelete,
	}
}
