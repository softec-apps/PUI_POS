'use client'

import { useCallback, useState } from 'react'
import { I_Attribute } from '@/common/types/modules/attribute'

export const useModalState = () => {
	// Dialog state
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [currentRecord, setCurrentRecord] = useState<Partial<I_Attribute> | null>(null)

	// Hard delete modal state
	const [isHardDeleteModalOpen, setIsHardDeleteModalOpen] = useState(false)
	const [attributeToHardDelete, setAttributeToHardDelete] = useState<I_Attribute | null>(null)
	const [isHardDeleting, setIsHardDeleting] = useState(false)

	// Dialog handlers
	const openCreateDialog = useCallback(() => {
		setCurrentRecord(null)
		setIsDialogOpen(true)
	}, [])

	const openEditDialog = useCallback((attribute: I_Attribute) => {
		setCurrentRecord(attribute)
		setIsDialogOpen(true)
	}, [])

	const closeDialog = useCallback(() => {
		setIsDialogOpen(false)
		setCurrentRecord(null)
	}, [])

	// Hard delete modal handlers
	const openHardDeleteModal = useCallback(
		(attribute: I_Attribute) => {
			setAttributeToHardDelete(attribute)
			setIsHardDeleteModalOpen(true)
		},
		[setAttributeToHardDelete]
	)

	const closeHardDeleteModal = useCallback(() => {
		if (!isHardDeleting) {
			setIsHardDeleteModalOpen(false)
			setAttributeToHardDelete(null)
		}
	}, [isHardDeleting, setAttributeToHardDelete])

	return {
		// Dialog state
		isDialogOpen,
		currentRecord,
		openCreateDialog,
		openEditDialog,
		closeDialog,

		// Hard delete modal state
		isHardDeleteModalOpen,
		attributeToHardDelete,
		isHardDeleting,
		setIsHardDeleting,
		openHardDeleteModal,
		closeHardDeleteModal,
	}
}
