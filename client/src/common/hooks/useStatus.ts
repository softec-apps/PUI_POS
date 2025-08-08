import { I_Status } from '@/common/types/status'
import { statuses } from '@/common/constants/data/statuses-data'

export const useStatus = () => {
	const refetchRecords = () => {
		console.log('Refetching records...')
	}
	return {
		recordsData: statuses,
		loading: false,
		error: null,
		refetchRecords,
	}
}

export type { I_Status }
