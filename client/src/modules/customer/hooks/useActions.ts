import { useCallback } from 'react'
import { I_CreateCustomer } from '@/common/types/modules/customer'
import { CustomerFormData } from '@/modules/customer/types/customer-form'

interface ActionsProps {
	createRecord: (data: I_CreateCustomer) => Promise<void>
	updateRecord: (id: string, data: I_CreateCustomer) => Promise<void>
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
}: ActionsProps) => {
	const transformFormData = (data: CustomerFormData): I_CreateCustomer => ({
		...data,
	})

	const handleSubmit = useCallback(
		async (data: CustomerFormData, recordId?: string): Promise<void> => {
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
