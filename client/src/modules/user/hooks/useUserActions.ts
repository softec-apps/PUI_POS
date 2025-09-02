import { useCallback } from 'react'
import { I_CreateUser } from '@/common/types/modules/user'
import { UserFormData } from '@/modules/user/types/user-form'

interface UserActionsProps {
	createRecord: (data: I_CreateUser) => Promise<void>
	updateRecord: (id: string, data: I_CreateUser) => Promise<void>
	softDeleteRecord: (id: string) => Promise<void>
	hardDeleteRecord: (id: string) => Promise<void>
	restoreRecord?: (id: string) => Promise<void>
}

export const useUserActions = ({
	createRecord,
	updateRecord,
	softDeleteRecord,
	hardDeleteRecord,
	restoreRecord,
}: UserActionsProps) => {
	const transformFormData = (data: UserFormData): I_CreateUser => ({
		...data,
		photo: data.photo ? { id: data.photo } : null,
	})

	const handleSubmit = useCallback(
		async (data: UserFormData, recordId?: string): Promise<void> => {
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
