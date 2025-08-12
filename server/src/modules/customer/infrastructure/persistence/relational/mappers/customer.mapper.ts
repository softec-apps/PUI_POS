import { Customer } from '@/modules/customer/domain/customer'
import {
  CustomerType,
  IdentificationType,
  CustomerTypeLabels,
  IdentificationTypeLabels,
} from '@/modules/customer/customer.enum'
import { CustomerEntity } from '@/modules/customer/infrastructure/persistence/relational/entities/customer.entity'

export class CustomerMapper {
  static toDomain(raw: CustomerEntity): Customer {
    const domainEntity = new Customer()

    // Basic properties
    domainEntity.id = raw.id

    // Handle CustomerType with fallback - fix null/undefined checking
    domainEntity.customerType =
      raw.customerType &&
      Object.values(CustomerType).includes(raw.customerType as CustomerType)
        ? (raw.customerType as CustomerType)
        : CustomerType.REGULAR

    // Handle IdentificationType with fallback - fix null/undefined checking
    domainEntity.identificationType =
      raw.identificationType &&
      Object.values(IdentificationType).includes(
        raw.identificationType as IdentificationType,
      )
        ? (raw.identificationType as IdentificationType)
        : IdentificationType.IDENTIFICATION_CARD

    // Customer details
    domainEntity.identificationNumber = raw.identificationNumber
    domainEntity.firstName = raw.firstName
    domainEntity.lastName = raw.lastName
    domainEntity.email = raw.email
    domainEntity.phone = raw.phone
    domainEntity.address = raw.address

    // Timestamps
    domainEntity.createdAt = raw.createdAt
    domainEntity.updatedAt = raw.updatedAt
    domainEntity.deletedAt = raw.deletedAt

    return domainEntity
  }

  static toPersistence(domainEntity: Customer): CustomerEntity {
    const persistenceEntity = new CustomerEntity()

    // Basic properties
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id
    }

    // Handle CustomerType with fallback - fix null/undefined checking
    persistenceEntity.customerType =
      domainEntity.customerType &&
      Object.values(CustomerType).includes(domainEntity.customerType)
        ? domainEntity.customerType
        : CustomerType.REGULAR

    // Handle IdentificationType with fallback - convert enum to string for entity
    const identificationType =
      domainEntity.identificationType &&
      Object.values(IdentificationType).includes(
        domainEntity.identificationType,
      )
        ? domainEntity.identificationType
        : IdentificationType.IDENTIFICATION_CARD

    persistenceEntity.identificationType = identificationType as string

    // Customer details - handle null/undefined values properly
    persistenceEntity.identificationNumber = domainEntity.identificationNumber!
    persistenceEntity.firstName = domainEntity.firstName!
    persistenceEntity.lastName = domainEntity.lastName!
    persistenceEntity.email = domainEntity.email!
    persistenceEntity.phone = domainEntity.phone!
    persistenceEntity.address = domainEntity.address!

    // Timestamps
    if (domainEntity.createdAt) {
      persistenceEntity.createdAt = domainEntity.createdAt
    }
    if (domainEntity.updatedAt) {
      persistenceEntity.updatedAt = domainEntity.updatedAt
    }
    if (domainEntity.deletedAt) {
      persistenceEntity.deletedAt = domainEntity.deletedAt
    }

    return persistenceEntity
  }

  // Helper method to get enum labels
  static getCustomerTypeLabel(type: CustomerType): string {
    return CustomerTypeLabels[type]
  }

  static getIdentificationTypeLabel(type: IdentificationType): string {
    return IdentificationTypeLabels[type]
  }
}
