'use client'

import { useCallback, useState } from 'react'
import { I_Customer } from '@/common/types/modules/customer'

export const useModalState = () => {
	// Dialog state
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [currentRecord, setCurrentRecord] = useState<Partial<I_Customer> | null>(null)

	// Hard delete modal state
	const [isHardDeleteModalOpen, setIsHardDeleteModalOpen] = useState(false)
	const [categoryToHardDelete, setCategoryToHardDelete] = useState<I_Customer | null>(null)
	const [isHardDeleting, setIsHardDeleting] = useState(false)

	// Dialog handlers
	const openCreateDialog = useCallback(() => {
		setCurrentRecord(null)
		setIsDialogOpen(true)
	}, [])

	const openEditDialog = useCallback((category: I_Customer) => {
		setCurrentRecord(category)
		setIsDialogOpen(true)
	}, [])

	const closeDialog = useCallback(() => {
		setIsDialogOpen(false)
		setCurrentRecord(null)
	}, [])

	// Hard delete modal handlers
	const openHardDeleteModal = useCallback(
		(category: I_Customer) => {
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

		// Hard delete modal state
		isHardDeleteModalOpen,
		categoryToHardDelete,
		isHardDeleting,
		setIsHardDeleting,
		openHardDeleteModal,
		closeHardDeleteModal,
	}
}
