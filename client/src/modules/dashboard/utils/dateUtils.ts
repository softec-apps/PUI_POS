export const getPeriodDates = (dateRange: string) => {
	const currentDate = new Date()
	const startDate = new Date()

	switch (dateRange) {
		case 'today':
			startDate?.setHours(0, 0, 0, 0)
			currentDate?.setHours(23, 59, 59, 999)
			break
		case 'yesterday':
			startDate?.setDate(startDate?.getDate() - 1)
			startDate?.setHours(0, 0, 0, 0)
			currentDate?.setDate(currentDate?.getDate() - 1)
			currentDate?.setHours(23, 59, 59, 999)
			break
		case '7':
			startDate?.setDate(startDate?.getDate() - 7)
			break
		case '15':
			startDate?.setDate(startDate?.getDate() - 15)
			break
		case '30':
			startDate?.setDate(startDate?.getDate() - 30)
			break
		case '1':
			startDate?.setMonth(startDate?.getMonth() - 1)
			break
		case '3':
			startDate?.setMonth(startDate?.getMonth() - 3)
			break
		case '6':
			startDate?.setMonth(startDate?.getMonth() - 6)
			break
		case '12':
			startDate?.setFullYear(startDate?.getFullYear() - 1)
			break
		case '0':
		default:
			startDate?.setFullYear(2000, 0, 1)
			break
	}

	return { startDate, endDate: currentDate }
}

export const getPreviousPeriodDates = (dateRange: string, currentStartDate: Date, currentEndDate: Date) => {
	if (dateRange === '0') return { previousStartDate: new Date(2000, 0, 1), previousEndDate: new Date(2000, 0, 1) }

	const periodDuration = currentEndDate?.getTime() - currentStartDate?.getTime()
	const previousEndDate = new Date(currentStartDate?.getTime() - 24 * 60 * 60 * 1000)
	const previousStartDate = new Date(previousEndDate?.getTime() - periodDuration)

	return { previousStartDate, previousEndDate }
}
