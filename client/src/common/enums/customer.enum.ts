export enum CustomerType {
	REGULAR = 'regular',
	FINAL_CONSUMER = 'final_consumer',
}

export enum IdentificationType {
	RUC = '04',
	IDENTIFICATION_CARD = '05',
	PASSPORT = '06',
	FINAL_CONSUMER = '07',
}

export const CustomerTypeLabels_ES = {
	[CustomerType.REGULAR]: 'Cliente Regular',
	[CustomerType.FINAL_CONSUMER]: 'Consumidor Final',
}

export const IdentificationTypeLabels_ES = {
	[IdentificationType.RUC]: 'RUC',
	[IdentificationType.IDENTIFICATION_CARD]: 'Cédula de Identidad',
	[IdentificationType.PASSPORT]: 'Pasaporte',
	[IdentificationType.FINAL_CONSUMER]: 'Consumidor Final',
} as const
