import { ApiConfig } from '@/common/types/api'
import { ENDPOINT_API } from '@/common/constants/APIEndpoint-const'

export const PRODUCT_ENDPOINTS_CONFIG: ApiConfig = {
	queryKey: [ENDPOINT_API.PRODUCT],
	baseEndpoint: `/${ENDPOINT_API.PRODUCT}`,
	extraInvalidateKeys: [
		[ENDPOINT_API.KARDEX],
		[ENDPOINT_API.CATEGORY],
		[ENDPOINT_API.SUPPLIER],
		[ENDPOINT_API.BRAND],
		[ENDPOINT_API.PRODUCT],
	],
	endpoints: {
		list: { path: '', method: 'GET' },
		getById: { path: '/:id', method: 'GET', params: ['id'] },
		create: { path: '', method: 'POST' },
		update: { path: '/:id', method: 'PUT', params: ['id'] },
		softDelete: { path: '/:id', method: 'DELETE', params: ['id'] },
		restore: { path: '/:id/restore', method: 'PATCH', params: ['id'] },
		hardDelete: { path: '/:id/hard-delete', method: 'DELETE', params: ['id'] },
		bulkImport: {
			path: '/bulk-import/excel',
			method: 'POST',
		},
	},
}
