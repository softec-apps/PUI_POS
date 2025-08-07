'use client'

import { useCallback, useState } from 'react'
import { I_Brand } from '@/common/types/modules/brand'

export const useModalState = () => {
	// Dialog state - CAMBIO: usar I_Brand | null en lugar de Partial<I_Brand>
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [currentRecord, setCurrentRecord] = useState<I_Brand | null>(null)

	// Soft delete modal state
	const [isSoftDeleteModalOpen, setIsSoftDeleteModalOpen] = useState(false)
	const [brandToDelete, setbrandToDelete] = useState<I_Brand | null>(null)
	const [isSoftDeleting, setIsSoftDeleting] = useState(false)

	// Restore modal state
	const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false)
	const [brandToRestore, setbrandToRestore] = useState<I_Brand | null>(null)
	const [isRestoring, setIsRestoring] = useState(false)

	// Hard delete modal state
	const [isHardDeleteModalOpen, setIsHardDeleteModalOpen] = useState(false)
	const [brandToHardDelete, setbrandToHardDelete] = useState<I_Brand | null>(null)
	const [isHardDeleting, setIsHardDeleting] = useState(false)

	// Dialog handlers
	const openCreateDialog = useCallback(() => {
		setCurrentRecord(null)
		setIsDialogOpen(true)
	}, [])

	const openEditDialog = useCallback((brand: I_Brand) => {
		setCurrentRecord(brand)
		setIsDialogOpen(true)
	}, [])

	const closeDialog = useCallback(() => {
		setIsDialogOpen(false)
		setCurrentRecord(null)
	}, [])

	// Soft delete modal handlers
	const openSoftDeleteModal = useCallback(
		(brand: I_Brand) => {
			setbrandToDelete(brand)
			setIsSoftDeleteModalOpen(true)
		},
		[setbrandToDelete]
	)

	const closeSoftDeleteModal = useCallback(() => {
		if (!isSoftDeleting) {
			setIsSoftDeleteModalOpen(false)
			setbrandToDelete(null)
		}
	}, [isSoftDeleting, setbrandToDelete])

	// Restore modal handlers
	const openRestoreModal = useCallback((brand: I_Brand) => {
		setbrandToRestore(brand)
		setIsRestoreModalOpen(true)
	}, [])

	const closeRestoreModal = useCallback(() => {
		if (!isRestoring) {
			setIsRestoreModalOpen(false)
			setbrandToRestore(null)
		}
	}, [isRestoring])

	// Hard delete modal handlers
	const openHardDeleteModal = useCallback(
		(brand: I_Brand) => {
			setbrandToHardDelete(brand)
			setIsHardDeleteModalOpen(true)
		},
		[setbrandToHardDelete]
	)

	const closeHardDeleteModal = useCallback(() => {
		if (!isHardDeleting) {
			setIsHardDeleteModalOpen(false)
			setbrandToHardDelete(null)
		}
	}, [isHardDeleting, setbrandToHardDelete])

	return {
		// Dialog state
		isDialogOpen,
		currentRecord,
		openCreateDialog,
		openEditDialog,
		closeDialog,

		// Soft delete modal state
		isSoftDeleteModalOpen,
		brandToDelete,
		isSoftDeleting,
		setIsSoftDeleting,
		openSoftDeleteModal,
		closeSoftDeleteModal,

		// Restore modal state
		isRestoreModalOpen,
		brandToRestore,
		isRestoring,
		setIsRestoring,
		openRestoreModal,
		closeRestoreModal,

		// Hard delete modal state
		isHardDeleteModalOpen,
		brandToHardDelete,
		isHardDeleting,
		setIsHardDeleting,
		openHardDeleteModal,
		closeHardDeleteModal,
	}
}
