import api from '@/lib/axios'
import { ApiEndpoint } from '@/common/types/api'

export class ApiService {
	private readonly baseEndpoint: string

	constructor(baseEndpoint: string) {
		this.baseEndpoint = baseEndpoint.startsWith('/') ? baseEndpoint : `/${baseEndpoint}`
	}

	// Reemplazamos :param con su valor en un solo paso
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private buildUrl(endpoint: ApiEndpoint, params: Record<string, any> = {}): string {
		const path = endpoint.path.replace(/:(\w+)/g, (_, key) => {
			const val = params[key]
			if (val === undefined) {
				console.warn(`Missing URL param "${key}" for ${endpoint.path}`)
				return ''
			}
			return encodeURIComponent(val)
		})
		return `${this.baseEndpoint}${path}`
	}

	// Ejecuta petición con tipado genérico T
	async executeRequest<T>(
		endpoint: ApiEndpoint,
		options: {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			urlParams?: Record<string, any>
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			queryParams?: Record<string, any>
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			data?: any
		} = {}
	): Promise<T> {
		const url = this.buildUrl(endpoint, options.urlParams ?? {})
		const config = { params: options.queryParams }

		// Elegimos método dinámicamente: get/delete sin body, resto incluyen body
		const method = endpoint.method.toLowerCase() as 'get' | 'post' | 'put' | 'patch' | 'delete'

		let axiosPromise
		if (method === 'get' || method === 'delete') {
			axiosPromise = api[method]<T>(url, config)
		} else {
			axiosPromise = api[method]<T>(url, options.data, config)
		}

		const { data } = await axiosPromise

		return data
	}
}
