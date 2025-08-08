export interface PaginationParams {
	page?: number
	limit?: number
	filters?: string
	sort?: string
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: string]: any
}

export interface SuccessMessages {
	create?: string
	update?: string
	restore?: string
	softDelete?: string
	hardDelete?: string
	[key: string]: string | undefined // Para mensajes personalizados
}

export interface ApiEndpoint {
	path: string
	method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
	params?: string[]
}

export interface ApiConfig {
	baseEndpoint: string
	queryKey?: string[]
	extraInvalidateKeys?: string[][]
	enabled?: boolean
	staleTime?: number
	endpoints?: {
		list?: ApiEndpoint
		create?: ApiEndpoint
		update?: ApiEndpoint
		delete?: ApiEndpoint
		restore?: ApiEndpoint
		[key: string]: ApiEndpoint | undefined // Para endpoints personalizados
	}
}
