import { Supplier } from '@/modules/suppliers/domain/supplier'
import { SupplierStatus } from '@/modules/suppliers/status.enum'
import { SupplierEntity } from '@/modules/suppliers/infrastructure/persistence/relational/entities/supplier.entity'

export class SupplierMapper {
  static toDomain(raw: SupplierEntity): Supplier {
    const domainEntity = new Supplier()
    domainEntity.id = raw.id
    domainEntity.ruc = raw.ruc
    domainEntity.legalName = raw.legalName
    domainEntity.commercialName = raw.commercialName
    domainEntity.status = Object.values(SupplierStatus).includes(raw.status)
      ? raw.status
      : SupplierStatus.INACTIVE
    domainEntity.createdAt = raw.createdAt
    domainEntity.updatedAt = raw.updatedAt
    domainEntity.deletedAt = raw.deletedAt

    return domainEntity
  }

  static toPersistence(domainEntity: Supplier): SupplierEntity {
    const persistenceEntity = new SupplierEntity()

    // Asignación directa de propiedades básicas
    persistenceEntity.id = domainEntity.id
    persistenceEntity.ruc = domainEntity.ruc
    persistenceEntity.legalName = domainEntity.legalName
    persistenceEntity.commercialName = domainEntity.commercialName

    // Validación del status
    persistenceEntity.status = Object.values(SupplierStatus).includes(
      domainEntity.status as SupplierStatus,
    )
      ? (domainEntity.status as SupplierStatus)
      : SupplierStatus.INACTIVE

    // Asignación de fechas
    persistenceEntity.createdAt = domainEntity.createdAt
    persistenceEntity.updatedAt = domainEntity.updatedAt
    persistenceEntity.deletedAt = domainEntity.deletedAt ?? null

    return persistenceEntity
  }
}
