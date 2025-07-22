import { Brand } from '@/modules/brand/domain/brand'
import { BrandStatus } from '@/modules/brand/status.enum'
import { BrandEntity } from '@/modules/brand/infrastructure/persistence/relational/entities/brand.entity'

export class BrandMapper {
  static toDomain(raw: BrandEntity): Brand {
    const domainEntity = new Brand()
    domainEntity.id = raw.id
    domainEntity.name = raw.name
    domainEntity.description = raw.description
    domainEntity.status = Object.values(BrandStatus).includes(raw.status)
      ? raw.status
      : BrandStatus.INACTIVE
    domainEntity.createdAt = raw.createdAt
    domainEntity.updatedAt = raw.updatedAt
    domainEntity.deletedAt = raw.deletedAt

    return domainEntity
  }

  static toPersistence(domainEntity: Brand): BrandEntity {
    const persistenceEntity = new BrandEntity()

    // Asignación directa de propiedades básicas
    persistenceEntity.id = domainEntity.id
    persistenceEntity.name = domainEntity.name
    persistenceEntity.description = domainEntity.description

    // Validación del status
    persistenceEntity.status = Object.values(BrandStatus).includes(
      domainEntity.status as BrandStatus,
    )
      ? (domainEntity.status as BrandStatus)
      : BrandStatus.INACTIVE

    // Asignación de fechas
    persistenceEntity.createdAt = domainEntity.createdAt
    persistenceEntity.updatedAt = domainEntity.updatedAt
    persistenceEntity.deletedAt = domainEntity.deletedAt

    return persistenceEntity
  }
}
