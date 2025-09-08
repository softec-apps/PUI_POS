export enum PaymentMethod {
	CASH = 'cash',
	CARD = 'card',
	DIGITAL = 'digital',
}

export const PaymentMethodLabels_ES = {
	[PaymentMethod.CASH]: 'Efectivo',
	[PaymentMethod.CARD]: 'Tarjeta',
	[PaymentMethod.DIGITAL]: 'Digital',
}

export enum StatusSRI {
	AUTHORIZED = 'AUTHORIZED',
	ERROR = 'ERROR',
	NO_ELECTRONIC = 'NO_ELECTRONIC',
}

export const StatusSRILabels_ES = {
	[StatusSRI.AUTHORIZED]: 'Autorizado',
	[StatusSRI.ERROR]: 'Error',
	[StatusSRI.NO_ELECTRONIC]: 'Simple',
}
