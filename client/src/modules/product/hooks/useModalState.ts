'use client'

import { useCallback, useState } from 'react'
import { I_Product } from '@/common/types/modules/product'

export const useModalState = () => {
	// Dialog state
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [currentRecord, setCurrentRecord] = useState<Partial<I_Product> | null>(null)

	// Soft delete modal state
	const [isSoftDeleteModalOpen, setIsSoftDeleteModalOpen] = useState(false)
	const [recordToSoftDelete, setRecordToSoftDelete] = useState<I_Product | null>(null)
	const [isSoftDeleting, setIsSoftDeleting] = useState(false)

	// Restore modal state
	const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false)
	const [recordToRestore, setRecordToRestore] = useState<I_Product | null>(null)
	const [isRestoring, setIsRestoring] = useState(false)

	// Hard delete modal state
	const [isHardDeleteModalOpen, setIsHardDeleteModalOpen] = useState(false)
	const [recordToHardDelete, setRecordToHardDelete] = useState<I_Product | null>(null)
	const [isHardDeleting, setIsHardDeleting] = useState(false)

	// Dialog handlers
	const openCreateDialog = useCallback(() => {
		setCurrentRecord(null)
		setIsDialogOpen(true)
	}, [])

	const openEditDialog = useCallback((product: I_Product) => {
		setCurrentRecord(product)
		setIsDialogOpen(true)
	}, [])

	const closeDialog = useCallback(() => {
		setIsDialogOpen(false)
		setCurrentRecord(null)
	}, [])

	// Soft delete modal handlers
	const openSoftDeleteModal = useCallback(
		(product: I_Product) => {
			setRecordToSoftDelete(product)
			setIsSoftDeleteModalOpen(true)
		},
		[setRecordToSoftDelete]
	)
	const closeSoftDeleteModal = useCallback(() => {
		if (!isSoftDeleting) {
			setIsSoftDeleteModalOpen(false)
			setRecordToSoftDelete(null)
		}
	}, [isSoftDeleting, setRecordToSoftDelete])

	// Restore modal handlers
	const openRestoreModal = useCallback(
		(product: I_Product) => {
			setRecordToRestore(product)
			setIsRestoreModalOpen(true)
		},
		[setRecordToRestore]
	)
	const closeRestoreModal = useCallback(() => {
		if (!isSoftDeleting) {
			setIsRestoreModalOpen(false)
			setRecordToRestore(null)
		}
	}, [isSoftDeleting, setRecordToRestore])

	// Hard delete modal handlers
	const openHardDeleteModal = useCallback(
		(product: I_Product) => {
			setRecordToHardDelete(product)
			setIsHardDeleteModalOpen(true)
		},
		[setRecordToHardDelete]
	)
	const closeHardDeleteModal = useCallback(() => {
		if (!isHardDeleting) {
			setIsHardDeleteModalOpen(false)
			setRecordToHardDelete(null)
		}
	}, [isHardDeleting, setRecordToHardDelete])

	return {
		// Dialog state
		isDialogOpen,
		currentRecord,
		openCreateDialog,
		openEditDialog,
		closeDialog,

		// Soft delete modal state
		isSoftDeleteModalOpen,
		recordToSoftDelete,
		isSoftDeleting,
		setIsSoftDeleting,
		openSoftDeleteModal,
		closeSoftDeleteModal,

		// Restore  modal state
		isRestoreModalOpen,
		recordToRestore,
		isRestoring,
		setIsRestoring,
		openRestoreModal,
		closeRestoreModal,

		// Hard delete modal state
		isHardDeleteModalOpen,
		recordToHardDelete,
		isHardDeleting,
		setIsHardDeleting,
		openHardDeleteModal,
		closeHardDeleteModal,
	}
}
