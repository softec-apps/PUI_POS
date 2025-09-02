import { useCallback } from 'react'
import { I_CreateBrand } from '@/common/types/modules/brand'
import { BrandFormData } from '@/modules/brand/types/brand-form'

interface ActionsProps {
	createRecord: (data: I_CreateBrand) => Promise<void>
	updateRecord: (id: string, data: I_CreateBrand) => Promise<void>
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
	const transformFormData = (data: BrandFormData): I_CreateBrand => ({
		...data,
	})

	const handleSubmit = useCallback(
		async (data: BrandFormData, recordId?: string): Promise<void> => {
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
