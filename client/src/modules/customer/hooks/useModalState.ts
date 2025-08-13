'use client'

import { useCallback, useState } from 'react'
import { I_Customer } from '@/common/types/modules/customer'

export const useModalState = () => {
	// Dialog state
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [currentRecord, setCurrentRecord] = useState<Partial<I_Customer> | null>(null)

	// Hard delete modal state
	const [isHardDeleteModalOpen, setIsHardDeleteModalOpen] = useState(false)
	const [recordToHardDelete, setRecordToHardDelete] = useState<I_Customer | null>(null)
	const [isHardDeleting, setIsHardDeleting] = useState(false)

	// Dialog handlers
	const openCreateDialog = useCallback(() => {
		setCurrentRecord(null)
		setIsDialogOpen(true)
	}, [])

	const openEditDialog = useCallback((customer: I_Customer) => {
		setCurrentRecord(customer)
		setIsDialogOpen(true)
	}, [])

	const closeDialog = useCallback(() => {
		setIsDialogOpen(false)
		setCurrentRecord(null)
	}, [])

	// Hard delete modal handlers
	const openHardDeleteModal = useCallback(
		(customer: I_Customer) => {
			setRecordToHardDelete(customer)
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

		// Hard delete modal state
		isHardDeleteModalOpen,
		recordToHardDelete,
		isHardDeleting,
		setIsHardDeleting,
		openHardDeleteModal,
		closeHardDeleteModal,
	}
}
