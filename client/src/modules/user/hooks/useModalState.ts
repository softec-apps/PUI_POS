'use client'

import { useCallback, useState } from 'react'
import { I_User } from '@/common/types/modules/user'

export const useModalState = () => {
	// Dialog state
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [currentRecord, setCurrentRecord] = useState<Partial<I_User> | null>(null)

	// Soft delete modal state
	const [isSoftDeleteModalOpen, setIsSoftDeleteModalOpen] = useState(false)
	const [recordToSoftDelete, setRecordToSoftDelete] = useState<I_User | null>(null)
	const [isSoftDeleting, setIsSoftDeleting] = useState(false)

	// Hard delete modal state
	const [isHardDeleteModalOpen, setIsHardDeleteModalOpen] = useState(false)
	const [recordToHardDelete, setRecordToHardDelete] = useState<I_User | null>(null)
	const [isHardDeleting, setIsHardDeleting] = useState(false)

	// Dialog handlers
	const openCreateDialog = useCallback(() => {
		setCurrentRecord(null)
		setIsDialogOpen(true)
	}, [])

	const openEditDialog = useCallback((user: I_User) => {
		setCurrentRecord(user)
		setIsDialogOpen(true)
	}, [])

	const closeDialog = useCallback(() => {
		setIsDialogOpen(false)
		setCurrentRecord(null)
	}, [])

	// Hard delete modal handlers
	const openHardDeleteModal = useCallback(
		(user: I_User) => {
			setRecordToHardDelete(user)
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

	// Soft delete modal handlers
	const openSoftDeleteModal = useCallback(
		(user: I_User) => {
			setRecordToSoftDelete(user)
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

	return {
		// Dialog state
		isDialogOpen,
		currentRecord,
		openCreateDialog,
		openEditDialog,
		closeDialog,

		// Hard delete modal state
		isHardDeleteModalOpen,
		recordToHardDelete,
		isHardDeleting,
		setIsHardDeleting,
		openHardDeleteModal,
		closeHardDeleteModal,

		// Soft delete modal state
		isSoftDeleteModalOpen,
		recordToSoftDelete,
		isSoftDeleting,
		setIsSoftDeleting,
		openSoftDeleteModal,
		closeSoftDeleteModal,
	}
}
