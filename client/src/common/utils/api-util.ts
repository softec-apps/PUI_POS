import { getSession } from 'next-auth/react'

interface RequestOptions extends RequestInit {
	headers?: Record<string, string>
}

export async function authenticatedFetch(url: string, options: RequestOptions = {}): Promise<Response> {
	const session = await getSession()

	if (!session?.accessToken) {
		throw new Error('No hay token de acceso disponible')
	}

	const config: RequestOptions = {
		...options,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${session.accessToken}`,
			...options.headers,
		},
	}

	const response = await fetch(url, config)

	if (!response.ok) {
		if (response.status === 401) {
			throw new Error('Token expirado')
		}
		throw new Error(`Error en la petición: ${response.status}`)
	}

	return response
}

export async function apiRequest<T>(url: string, options: RequestOptions = {}): Promise<T> {
	const response = await authenticatedFetch(url, options)
	return response.json()
}
