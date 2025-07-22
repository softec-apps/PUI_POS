import { ApiConfig } from '@/common/types/api'
import { ENDPOINT_API } from '@/common/constants/APIEndpoint-const'

export const TEMPLATE_ENDPOINTS_CONFIG: ApiConfig = {
	baseEndpoint: `/${ENDPOINT_API.TEMPLATE}`,
	queryKey: [ENDPOINT_API.TEMPLATE],
	successMessages: {
		create: 'Plantilla creada exitosamente',
		update: 'Plantilla actualizada exitosamente',
		hardDelete: 'Plantilla eliminada permanentemente',
	},
	endpoints: {
		list: { path: '', method: 'GET' },
		create: { path: '', method: 'POST' },
		update: { path: '/:id', method: 'PUT', params: ['id'] },
		hardDelete: { path: '/:id/hard-delete', method: 'DELETE', params: ['id'] },
	},
}
