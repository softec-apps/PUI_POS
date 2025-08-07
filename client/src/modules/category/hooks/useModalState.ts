'use client'

import { useCallback, useState } from 'react'
import { I_Category } from '@/common/types/modules/category'

export const useModalState = () => {
	// Dialog state
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [currentRecord, setCurrentRecord] = useState<Partial<I_Category> | null>(null)

	// Soft delete modal state
	const [isSoftDeleteModalOpen, setIsSoftDeleteModalOpen] = useState(false)
	const [categoryToDelete, setCategoryToDelete] = useState<I_Category | null>(null)
	const [isSoftDeleting, setIsSoftDeleting] = useState(false)

	// Restore modal state
	const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false)
	const [categoryToRestore, setCategoryToRestore] = useState<I_Category | null>(null)
	const [isRestoring, setIsRestoring] = useState(false)

	// Hard delete modal state
	const [isHardDeleteModalOpen, setIsHardDeleteModalOpen] = useState(false)
	const [categoryToHardDelete, setCategoryToHardDelete] = useState<I_Category | null>(null)
	const [isHardDeleting, setIsHardDeleting] = useState(false)

	// Dialog handlers
	const openCreateDialog = useCallback(() => {
		setCurrentRecord(null)
		setIsDialogOpen(true)
	}, [])

	const openEditDialog = useCallback((category: I_Category) => {
		setCurrentRecord(category)
		setIsDialogOpen(true)
	}, [])

	const closeDialog = useCallback(() => {
		setIsDialogOpen(false)
		setCurrentRecord(null)
	}, [])

	// Soft delete modal handlers
	const openSoftDeleteModal = useCallback(
		(category: I_Category) => {
			setCategoryToDelete(category)
			setIsSoftDeleteModalOpen(true)
		},
		[setCategoryToDelete]
	)

	const closeSoftDeleteModal = useCallback(() => {
		if (!isSoftDeleting) {
			setIsSoftDeleteModalOpen(false)
			setCategoryToDelete(null)
		}
	}, [isSoftDeleting, setCategoryToDelete])

	// Restore modal handlers
	const openRestoreModal = useCallback((category: I_Category) => {
		setCategoryToRestore(category)
		setIsRestoreModalOpen(true)
	}, [])

	const closeRestoreModal = useCallback(() => {
		if (!isRestoring) {
			setIsRestoreModalOpen(false)
			setCategoryToRestore(null)
		}
	}, [isRestoring])

	// Hard delete modal handlers
	const openHardDeleteModal = useCallback(
		(category: I_Category) => {
			setCategoryToHardDelete(category)
			setIsHardDeleteModalOpen(true)
		},
		[setCategoryToHardDelete]
	)

	const closeHardDeleteModal = useCallback(() => {
		if (!isHardDeleting) {
			setIsHardDeleteModalOpen(false)
			setCategoryToHardDelete(null)
		}
	}, [isHardDeleting, setCategoryToHardDelete])

	return {
		// Dialog state
		isDialogOpen,
		currentRecord,
		openCreateDialog,
		openEditDialog,
		closeDialog,

		// Soft delete modal state
		isSoftDeleteModalOpen,
		categoryToDelete,
		isSoftDeleting,
		setIsSoftDeleting,
		openSoftDeleteModal,
		closeSoftDeleteModal,

		// Restore modal state
		isRestoreModalOpen,
		categoryToRestore,
		isRestoring,
		setIsRestoring,
		openRestoreModal,
		closeRestoreModal,

		// Hard delete modal state
		isHardDeleteModalOpen,
		categoryToHardDelete,
		isHardDeleting,
		setIsHardDeleting,
		openHardDeleteModal,
		closeHardDeleteModal,
	}
}
