import { toast } from 'sonner'
import { HttpErrorResponse } from '../types/httpErrorResponse'

const getToastMethod = (status: number) => {
	if (status >= 200 && status < 300) return toast.success
	if (status >= 400 && status < 500) return toast.warning
	return toast.error
}

/**
 * Handles HTTP notifications, including network errors (ERR_NETWORK) and validation errors.
 * @param error - Error object (can be AxiosError or HTTP response).
 * @param customMessages - Custom messages by status code (optional).
 */
export function handleHttpToast(error: HttpErrorResponse, customMessages: Record<number, string> = {}) {
	// Case 1: Network error (ERR_NETWORK, no connection, etc.)
	if (error.code === 'ERR_NETWORK' || error.message === 'Network Error')
		return toast.error('Error de conexión. Verifica tu red e intenta nuevamente.')

	// Case 2: HTTP error with response (e.g., 422, 500, etc.)
	if (error?.response?.data) {
		const { status, data } = error.response

		// Use custom message if available
		if (customMessages[status]) return getToastMethod(status)(customMessages[status])

		// Handle validation errors with details
		if (data.error?.details) {
			const details = data.error.details
			const detailMessages = Object.values(details).join(', ')
			return getToastMethod(status)(`${detailMessages}`)
		}

		// Fallback to error message if available
		if (data.error?.message) return getToastMethod(status)(data.error.message)

		// Generic error message if no specific message is found
		return getToastMethod(status)('Error en la solicitud')
	}

	// Case 3: Generic error (no response or network code)
	toast.error('Error inesperado. Por favor, intenta más tarde.')
}
