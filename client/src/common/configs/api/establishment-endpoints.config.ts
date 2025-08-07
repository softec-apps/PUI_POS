import { ApiConfig } from '@/common/types/api'
import { ENDPOINT_API } from '@/common/constants/APIEndpoint-const'

export const ESTABLISHMENT_ENDPOINTS_CONFIG: ApiConfig = {
	queryKey: [ENDPOINT_API.ESTABLISHMENT],
	baseEndpoint: `/${ENDPOINT_API.ESTABLISHMENT}`,
	successMessages: {
		create: 'Preferencias creadas exitosamente',
		update: 'Preferencias actualizadas exitosamente',
	},
	endpoints: {
		list: { path: '', method: 'GET' },
		create: { path: '', method: 'POST' },
		update: { path: '/:id', method: 'PUT', params: ['id'] },
	},
}
