import 'dayjs/locale/es'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import localizedFormat from 'dayjs/plugin/localizedFormat'

// Configurar plugins
dayjs.extend(localizedFormat)
dayjs.extend(utc)
dayjs.extend(timezone)

/**
 * Formatea una fecha ISO usando Day.js con soporte para locale.
 * @param isoDate - Fecha en formato ISO 8601.
 * @param includeTime - Si es true, incluye hora en formato 24h.
 * @param locale - Configuración regional (ej: 'es', 'en'). Por defecto 'es'.
 * @returns Fecha formateada según el locale.
 */
export const formatDate = (
	isoDate: string | Date | null,
	includeTime: boolean = false,
	locale: string = 'es'
): string => {
	if (!isoDate) return ''

	try {
		dayjs.locale(locale)
		// Convertir de UTC a la zona horaria local del navegador
		const date = dayjs.utc(isoDate).local()

		return includeTime
			? date.format('DD MMMM YYYY [-] HH:mm:ss') // "21 julio 2025 - 09:37:53"
			: date.format('DD MMMM YYYY') // "21 julio 2025"
	} catch (error) {
		console.error('Error al formatear con Day.js:', error)
		return 'Fecha inválida'
	}
}

// Función usada para formatear las fechas (rango de fechas) - Shadcn Calendar
interface DateRange {
	from?: Date | string | null
	to?: Date | string | null
}

export function formatDateParams(startDate?: string | Date | DateRange | null, endDate?: string | Date | null) {
	// Caso cuando startDate es un objeto de rango (como el de ShadCN)
	if (startDate && typeof startDate === 'object' && 'from' in startDate) {
		const range = startDate as DateRange
		return {
			formattedStartDate: range.from ? dayjs.utc(range.from).local().format('YYYY-MM-DD') : null,
			formattedEndDate: range.to ? dayjs.utc(range.to).local().format('YYYY-MM-DD') : null,
		}
	}

	// Caso tradicional con fechas separadas
	return {
		formattedStartDate: startDate ? dayjs.utc(startDate).local().format('YYYY-MM-DD') : null,
		formattedEndDate: endDate ? dayjs.utc(endDate).local().format('YYYY-MM-DD') : null,
	}
}
