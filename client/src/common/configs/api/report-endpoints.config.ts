import { ApiConfig } from '@/common/types/api'
import { ENDPOINT_API } from '@/common/constants/APIEndpoint-const'

export const REPORT_ENDPOINTS_CONFIG: ApiConfig = {
	queryKey: [ENDPOINT_API.REPORT],
	baseEndpoint: `/${ENDPOINT_API.REPORT}`,
	endpoints: {
		list: { path: '', method: 'GET' },
	},
}
