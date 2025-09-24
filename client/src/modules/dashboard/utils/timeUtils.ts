export const getEcuadorTime = (): Date => {
	const now = new Date()
	const ecuadorTime = new Date(now?.getTime() + now?.getTimezoneOffset() * 60000 - 5 * 60 * 60 * 1000)
	return ecuadorTime
}

export const formatTime = (date: Date): string => {
	return date.toLocaleTimeString('es-EC', {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		timeZone: 'America/Guayaquil',
	})
}

export const getGreeting = (hour: number) => {
	if (hour >= 5 && hour < 12) {
		return { text: 'Buenos días', emoji: '🌅' }
	} else if (hour >= 12 && hour < 18) {
		return { text: 'Buenas tardes', emoji: '☀️' }
	} else if (hour >= 18 && hour < 22) {
		return { text: 'Buenas noches', emoji: '🌆' }
	} else {
		return { text: 'Buenas noches', emoji: '🌙' }
	}
}
