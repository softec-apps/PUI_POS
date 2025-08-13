'use client'

import { useCallback, useState } from 'react'
import { I_Sale } from '@/common/types/modules/sale'

export const useModalState = () => {
	// Dialog state
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [currentRecord, setCurrentRecord] = useState<Partial<I_Sale> | null>(null)

	// Hard delete modal state
	const [isHardDeleteModalOpen, setIsHardDeleteModalOpen] = useState(false)
	const [saleToHardDelete, setSaleToHardDelete] = useState<I_Sale | null>(null)
	const [isHardDeleting, setIsHardDeleting] = useState(false)

	// Dialog handlers
	const openCreateDialog = useCallback(() => {
		setCurrentRecord(null)
		setIsDialogOpen(true)
	}, [])

	const openEditDialog = useCallback((sale: I_Sale) => {
		setCurrentRecord(sale)
		setIsDialogOpen(true)
	}, [])

	const closeDialog = useCallback(() => {
		setIsDialogOpen(false)
		setCurrentRecord(null)
	}, [])

	// Hard delete modal handlers
	const openHardDeleteModal = useCallback(
		(sale: I_Sale) => {
			setSaleToHardDelete(sale)
			setIsHardDeleteModalOpen(true)
		},
		[setSaleToHardDelete]
	)

	const closeHardDeleteModal = useCallback(() => {
		if (!isHardDeleting) {
			setIsHardDeleteModalOpen(false)
			setSaleToHardDelete(null)
		}
	}, [isHardDeleting, setSaleToHardDelete])

	return {
		// Dialog state
		isDialogOpen,
		currentRecord,
		openCreateDialog,
		openEditDialog,
		closeDialog,

		// Hard delete modal state
		isHardDeleteModalOpen,
		saleToHardDelete,
		isHardDeleting,
		setIsHardDeleting,
		openHardDeleteModal,
		closeHardDeleteModal,
	}
}
