import { AxiosError } from 'axios'

// Tipo para errores con respuesta HTTP (ej. 422, 500)
interface HttpErrorResponse {
	code: string
	message: string
	// PARA RESPUESTAS DE LA API
	response: {
		status: number
		data?: {
			error: {
				message: string
				details?: Record<string, string> | null
			}
		}
	}
}

// Tipo para el parámetro `error` en handleHttpToast
type ErrorParam =
	| AxiosError // Errores de Axios (incluye ERR_NETWORK)
	| HttpErrorResponse // Respuestas HTTP fallidas manuales (sin Axios)
	| Error // Errores genéricos (por si acaso)
