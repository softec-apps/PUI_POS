import { I_Status } from '@/common/types/status'

export const statuses = {
	data: {
		items: [
			{
				id: '1',
				name: 'active',
			},
			{
				id: '2',
				name: 'inactive',
			},
		] as I_Status[],
		meta: {
			totalRecords: 2,
			totalPages: 1,
			currentPage: 1,
			pageSize: 10,
		},
	},
}
