import { CustomerType, IdentificationType } from '@/common/enums/customer.enum'

export const CustomerTypeES: Record<CustomerType, string> = {
	[CustomerType.REGULAR]: 'Persona natural',
	[CustomerType.FINAL_CONSUMER]: 'Consumidor final',
}

export const IdentificationTypeES: Record<IdentificationType, string> = {
	[IdentificationType.RUC]: 'RUC',
	[IdentificationType.PASSPORT]: 'Pasaporte',
	[IdentificationType.FINAL_CONSUMER]: 'Consumidor Final',
	[IdentificationType.IDENTIFICATION_CARD]: 'Cédula',
}

export const IdentificationLabelsES = {
	FINAL_CUSTOMER_ES: IdentificationTypeES[IdentificationType.FINAL_CONSUMER],
	IDENTIFICATION_CARD_ES: IdentificationTypeES[IdentificationType.IDENTIFICATION_CARD],
	PASSPORT_ES: IdentificationTypeES[IdentificationType.PASSPORT],
	RUC_ES: IdentificationTypeES[IdentificationType.RUC],
}

export const identificationTypeOptions = Object.values(IdentificationType).map(key => ({
	value: key,
	label: IdentificationTypeES[key as IdentificationType],
	/*
		[
		{ value: '04', label: 'RUC' },
		{ value: '05', label: 'Cédula' },
		{ value: '06', label: 'Pasaporte' },
		{ value: '07', label: 'Consumidor Final' },
		]
	*/
}))
