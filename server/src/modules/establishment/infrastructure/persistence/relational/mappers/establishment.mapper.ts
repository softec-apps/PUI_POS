import { Establishment } from '@/modules/establishment/domain/establishment'
import { FileMapper } from '@/modules/files/infrastructure/persistence/relational/mappers/file.mapper'
import { EstablishmentEntity } from '@/modules/establishment/infrastructure/persistence/relational/entities/establishment.entity'
import { FileEntity } from '@/modules/files/infrastructure/persistence/relational/entities/file.entity'

export class EstablishmentMapper {
  static toDomain(raw: EstablishmentEntity): Establishment {
    const domainEntity = new Establishment()

    domainEntity.id = raw.id
    domainEntity.ruc = raw.ruc
    domainEntity.companyName = raw.companyName
    domainEntity.tradeName = raw.tradeName
    domainEntity.parentEstablishmentAddress = raw.parentEstablishmentAddress
    domainEntity.accounting = raw.accounting
    domainEntity.photo = raw.photo ? FileMapper.toDomain(raw.photo) : null
    domainEntity.environmentType = raw.environmentType
    domainEntity.createdAt = raw.createdAt
    domainEntity.updatedAt = raw.updatedAt

    return domainEntity
  }

  static toPersistence(domainEntity: Establishment): EstablishmentEntity {
    const persistenceEntity = new EstablishmentEntity()

    persistenceEntity.id = domainEntity.id
    persistenceEntity.ruc = domainEntity.ruc // string
    persistenceEntity.companyName = domainEntity.companyName
    persistenceEntity.tradeName = domainEntity.tradeName
    persistenceEntity.parentEstablishmentAddress =
      domainEntity.parentEstablishmentAddress!
    persistenceEntity.accounting = domainEntity.accounting
    // Manejo de la foto
    if (domainEntity.photo) {
      persistenceEntity.photo = new FileEntity()
      persistenceEntity.photo.id = domainEntity.photo.id
      persistenceEntity.photo.path = domainEntity.photo.path
    } else {
      persistenceEntity.photo = null
    }
    persistenceEntity.environmentType = domainEntity.environmentType!
    persistenceEntity.createdAt = domainEntity.createdAt
    persistenceEntity.updatedAt = domainEntity.updatedAt

    return persistenceEntity
  }
}
