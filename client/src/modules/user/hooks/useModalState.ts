'use client'

import { useCallback, useState } from 'react'
import { I_Template } from '@/common/types/modules/template'

export const useModalState = () => {
	// Dialog state
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [currentRecord, setCurrentRecord] = useState<Partial<I_Template> | null>(null)

	// Hard delete modal state
	const [isHardDeleteModalOpen, setIsHardDeleteModalOpen] = useState(false)
	const [templateToHardDelete, setTemplateToHardDelete] = useState<I_Template | null>(null)
	const [isHardDeleting, setIsHardDeleting] = useState(false)

	// Dialog handlers
	const openCreateDialog = useCallback(() => {
		setCurrentRecord(null)
		setIsDialogOpen(true)
	}, [])

	const openEditDialog = useCallback((template: I_Template) => {
		setCurrentRecord(template)
		setIsDialogOpen(true)
	}, [])

	const closeDialog = useCallback(() => {
		setIsDialogOpen(false)
		setCurrentRecord(null)
	}, [])

	// Hard delete modal handlers
	const openHardDeleteModal = useCallback(
		(template: I_Template) => {
			setTemplateToHardDelete(template)
			setIsHardDeleteModalOpen(true)
		},
		[setTemplateToHardDelete]
	)

	const closeHardDeleteModal = useCallback(() => {
		if (!isHardDeleting) {
			setIsHardDeleteModalOpen(false)
			setTemplateToHardDelete(null)
		}
	}, [isHardDeleting, setTemplateToHardDelete])

	return {
		// Dialog state
		isDialogOpen,
		currentRecord,
		openCreateDialog,
		openEditDialog,
		closeDialog,

		// Hard delete modal state
		isHardDeleteModalOpen,
		templateToHardDelete,
		isHardDeleting,
		setIsHardDeleting,
		openHardDeleteModal,
		closeHardDeleteModal,
	}
}
