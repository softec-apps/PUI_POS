import { I_Role } from '@/common/types/roles'

export const roles = {
	data: {
		items: [
			{
				id: '1',
				name: 'admin',
			},
			{
				id: '2',
				name: 'cashier',
			},
			{
				id: '3',
				name: 'manager',
			},
			{
				id: '4',
				name: 'inventory',
			},
		] as I_Role[],
		meta: {
			totalRecords: 4,
			totalPages: 1,
			currentPage: 1,
			pageSize: 10,
		},
	},
}
