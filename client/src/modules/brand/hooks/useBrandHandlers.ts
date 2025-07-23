import { useCallback } from 'react'
import { ModalState } from '@/modules/brand/types/modalState'
import { BrandFormData } from '@/modules/brand/components/organisms/Modal/ModalBrandForm'
import { I_Brand, I_CreateBrand, I_UpdateBrand } from '@/modules/brand/types/brand'

interface UsebrandHandlersProps {
	modalState: ModalState
	createBrand: (data: I_CreateBrand) => Promise<void>
	updateBrand: (id: string, data: I_UpdateBrand) => Promise<void>
	restoreBrand: (id: string) => Promise<void>
	softDeletebrand: (id: string) => Promise<void>
	hardDeletebrand: (id: string) => Promise<void>
}

export function useBrandHandlers({
	modalState,
	createBrand,
	updateBrand,
	softDeletebrand,
	restoreBrand,
	hardDeletebrand,
}: UsebrandHandlersProps) {
	// Form handlers para el nuevo modal con react-hook-form
	const handleFormSubmit = useCallback(
		async (data: BrandFormData) => {
			try {
				const brandData: any = {
					name: data.name.trim(),
					description: data.description?.trim() || null,
				}

				// CAMBIO: Ahora currentRecord tiene el tipo correcto
				if (modalState.currentRecord?.id) {
					// Para actualizar, incluir el status actual
					const updateData: I_UpdateBrand = {
						...brandData,
						status: modalState.currentRecord.status
					}
					await updateBrand(modalState.currentRecord.id, updateData)
				} else {
					await createBrand(brandData)
				}

				modalState.closeDialog()
			} catch (error) {
				console.error('Save error:', error)
				throw error // Re-throw para que el form maneje el error
			}
		},
		[modalState, updateBrand, createBrand]
	)

	const handleDialogClose = useCallback(() => {
		modalState.closeDialog()
	}, [modalState])

	// Modal handlers
	const handleEdit = useCallback(
		(brand: I_Brand) => {
			console.log('Handler edit called with:', brand) // Debug log
			modalState.openEditDialog(brand)
		},
		[modalState]
	)

	const handleRestore = useCallback((brand: I_Brand) => modalState.openRestoreModal(brand), [modalState])

	// Status handlers
	const handleStatusToggle = useCallback(
		async (brand: I_Brand) => {
			try {
				const newStatus = brand.status === 'active' ? 'inactive' : 'active'
				const updateData: I_UpdateBrand = {
					name: brand.name,
					description: brand.description,
					status: newStatus
				}
				await updateBrand(brand.id, updateData)
			} catch (error) {
				console.error('Status toggle error:', error)
			}
		},
		[updateBrand]
	)

	const handleBulkStatusUpdate = useCallback(
		async (brandIds: string[], newStatus: 'active' | 'inactive') => {
			try {
				// Nota: Este enfoque puede necesitar optimización en el backend
				const updatePromises = brandIds.map(id => 
					updateBrand(id, { status: newStatus } as I_UpdateBrand)
				)
				await Promise.all(updatePromises)
			} catch (error) {
				console.error('Bulk status update error:', error)
			}
		},
		[updateBrand]
	)

	// Confirmation handlers
	const handleConfirmSoftDelete = useCallback(async () => {
		if (!modalState.brandToDelete) return

		try {
			modalState.setIsSoftDeleting(true)
			await softDeletebrand(modalState.brandToDelete.id)
			modalState.closeSoftDeleteModal()
		} catch (error) {
			console.error('Delete error:', error)
		} finally {
			modalState.setIsSoftDeleting(false)
		}
	}, [modalState, softDeletebrand])

	const handleConfirmRestore = useCallback(async () => {
		if (!modalState.brandToRestore) return

		try {
			modalState.setIsRestoring(true)
			await restoreBrand(modalState.brandToRestore.id)
			modalState.closeRestoreModal()
		} catch (error) {
			console.error('Restore error:', error)
		} finally {
			modalState.setIsRestoring(false)
		}
	}, [modalState, restoreBrand])

	const handleConfirmHardDelete = useCallback(async () => {
		if (!modalState.brandToHardDelete) return

		try {
			modalState.setIsHardDeleting(true)
			await hardDeletebrand(modalState.brandToHardDelete.id)
			modalState.closeHardDeleteModal()
		} catch (error) {
			console.error('Delete error:', error)
		} finally {
			modalState.setIsHardDeleting(false)
		}
	}, [modalState, hardDeletebrand])

	return {
		// Form handlers
		handleFormSubmit,
		handleDialogClose,

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