import { ApiConfig } from '@/common/types/api'
import { ENDPOINT_API } from '@/common/constants/APIEndpoint-const'

export const SUPPLIER_ENDPOINTS_CONFIG: ApiConfig = {
	queryKey: [ENDPOINT_API.SUPPLIER],
	baseEndpoint: `/${ENDPOINT_API.SUPPLIER}`,
	extraInvalidateKeys: [[ENDPOINT_API.SUPPLIER]],
	endpoints: {
		list: { path: '', method: 'GET' },
		create: { path: '', method: 'POST' },
		update: { path: '/:id', method: 'PUT', params: ['id'] },
		softDelete: { path: '/:id', method: 'DELETE', params: ['id'] },
		restore: { path: '/:id/restore', method: 'PATCH', params: ['id'] },
		hardDelete: { path: '/:id/hard-delete', method: 'DELETE', params: ['id'] },
	},
}
