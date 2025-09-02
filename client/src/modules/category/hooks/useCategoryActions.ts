import { useCallback } from 'react'
import { I_CreateCategory } from '@/common/types/modules/category'
import { CategoryFormData } from '@/modules/category/types/category-form'

interface UserActionsProps {
	createRecord: (data: I_CreateCategory) => Promise<void>
	updateRecord: (id: string, data: I_CreateCategory) => Promise<void>
	softDeleteRecord: (id: string) => Promise<void>
	hardDeleteRecord: (id: string) => Promise<void>
	restoreRecord?: (id: string) => Promise<void>
}

export const useActions = ({
	createRecord,
	updateRecord,
	softDeleteRecord,
	hardDeleteRecord,
	restoreRecord,
}: UserActionsProps) => {
	const transformFormData = (data: CategoryFormData): I_CreateCategory => ({
		...data,
		photo: data.photo ? { id: data.photo } : null,
	})

	const handleSubmit = useCallback(
		async (data: CategoryFormData, recordId?: string): Promise<void> => {
			const transformedData = transformFormData(data)

			if (recordId) {
				await updateRecord(recordId, transformedData)
			} else {
				await createRecord(transformedData)
			}
		},
		[createRecord, updateRecord]
	)

	const handleDelete = useCallback(
		async (recordId: string, type: 'hard' | 'soft'): Promise<void> => {
			if (type === 'hard') {
				await hardDeleteRecord(recordId)
			} else {
				await softDeleteRecord(recordId)
			}
		},
		[hardDeleteRecord, softDeleteRecord]
	)

	const handleRestore = useCallback(
		async (recordId: string): Promise<void> => {
			if (restoreRecord) await restoreRecord(recordId)
		},
		[restoreRecord]
	)

	return {
		handleSubmit,
		handleDelete,
		handleRestore,
	}
}
