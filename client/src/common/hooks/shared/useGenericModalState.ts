import { useCallback, useState } from 'react'

export function useGenericModalState<T>() {
	// Dialog state
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [currentRecord, setCurrentRecord] = useState<T | null>(null)

	// Hard delete modal state
	const [isHardDeleteModalOpen, setIsHardDeleteModalOpen] = useState(false)
	const [recordToHardDelete, setRecordToHardDelete] = useState<T | null>(null)

	// Dialog handlers
	const openCreateDialog = useCallback(() => {
		setCurrentRecord(null)
		setIsDialogOpen(true)
	}, [])

	const openEditDialog = useCallback((record: T) => {
		setCurrentRecord(record)
		setIsDialogOpen(true)
	}, [])

	const closeDialog = useCallback(() => {
		setIsDialogOpen(false)
		setCurrentRecord(null)
	}, [])

	// Hard delete modal handlers
	const openHardDeleteModal = useCallback((record: T) => {
		setRecordToHardDelete(record)
		setIsHardDeleteModalOpen(true)
	}, [])

	const closeHardDeleteModal = useCallback(() => {
		setIsHardDeleteModalOpen(false)
		setRecordToHardDelete(null)
	}, [])

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
		openHardDeleteModal,
		closeHardDeleteModal,
	}
}
