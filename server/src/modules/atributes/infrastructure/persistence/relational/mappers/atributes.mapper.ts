import { Atribute } from '@/modules/atributes/domain/atribute'
import { AtributeTypeAllow } from '@/modules/atributes/atribute-types-allow.enum'
import { AtributeEntity } from '@/modules/atributes/infrastructure/persistence/relational/entities/atribute.entity'

export class AtributeMapper {
  static toDomain(raw: AtributeEntity): Atribute {
    const domainEntity = new Atribute()

    domainEntity.id = raw.id
    domainEntity.name = raw.name
    domainEntity.type = raw.type
    domainEntity.options = raw.options ?? []
    domainEntity.required = raw.required
    domainEntity.createdAt = raw.createdAt
    domainEntity.updatedAt = raw.updatedAt

    return domainEntity
  }

  static toPersistence(domainEntity: Atribute): AtributeEntity {
    const persistenceEntity = new AtributeEntity()

    persistenceEntity.id = domainEntity.id
    persistenceEntity.name = domainEntity.name
    persistenceEntity.type = domainEntity.type ?? AtributeTypeAllow.TEXT
    persistenceEntity.options = domainEntity.options ?? []
    persistenceEntity.required = domainEntity.required
    persistenceEntity.createdAt = domainEntity.createdAt
    persistenceEntity.updatedAt = domainEntity.updatedAt

    return persistenceEntity
  }
}
