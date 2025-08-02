export const formatPrice = (value: number): string => {
	return new Intl.NumberFormat('es-EC', {
		style: 'decimal',
		useGrouping: true,
		minimumFractionDigits: 2,
		maximumFractionDigits: 6,
	}).format(value)
}
