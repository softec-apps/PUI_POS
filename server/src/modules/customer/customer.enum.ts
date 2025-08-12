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

export const CustomerTypeLabels: Record<CustomerType, string> = {
  [CustomerType.REGULAR]: 'Persona natural',
  [CustomerType.FINAL_CONSUMER]: 'Consumidor final',
}

export const IdentificationTypeLabels: Record<IdentificationType, string> = {
  [IdentificationType.RUC]: 'RUC',
  [IdentificationType.PASSPORT]: 'Pasaporte',
  [IdentificationType.FINAL_CONSUMER]: 'Consumidor Final',
  [IdentificationType.IDENTIFICATION_CARD]: 'Cédula',
}
