import { User } from '@/modules/users/domain/user'
import { FileMapper } from '@/modules/files/infrastructure/persistence/relational/mappers/file.mapper'
import { FileEntity } from '@/modules/files/infrastructure/persistence/relational/entities/file.entity'
import { RoleEntity } from '@/modules/roles/infrastructure/persistence/relational/entities/role.entity'
import { StatusEntity } from '@/statuses/infrastructure/persistence/relational/entities/status.entity'
import { UserEntity } from '@/modules/users/infrastructure/persistence/relational/entities/user.entity'

export class UserMapper {
  static toDomain(raw: UserEntity): User {
    const domainEntity = new User()

    domainEntity.id = raw.id
    domainEntity.email = raw.email
    domainEntity.password = raw.password
    domainEntity.provider = raw.provider
    domainEntity.socialId = raw.socialId
    domainEntity.firstName = raw.firstName
    domainEntity.lastName = raw.lastName

    // Manejo más seguro de la foto
    domainEntity.photo = raw.photo ? FileMapper.toDomain(raw.photo) : null

    domainEntity.role = raw.role
    domainEntity.status = raw.status
    domainEntity.createdAt = raw.createdAt
    domainEntity.updatedAt = raw.updatedAt
    domainEntity.deletedAt = raw.deletedAt

    return domainEntity
  }

  static toPersistence(domainEntity: User): UserEntity {
    const persistenceEntity = new UserEntity()

    persistenceEntity.id = domainEntity.id
    persistenceEntity.email = domainEntity.email
    persistenceEntity.password = domainEntity.password
    persistenceEntity.provider = domainEntity.provider
    persistenceEntity.socialId = domainEntity.socialId
    persistenceEntity.firstName = domainEntity.firstName
    persistenceEntity.lastName = domainEntity.lastName

    // Manejo de la foto
    if (domainEntity.photo) {
      persistenceEntity.photo = new FileEntity()
      persistenceEntity.photo.id = domainEntity.photo.id
      persistenceEntity.photo.path = domainEntity.photo.path
    } else {
      persistenceEntity.photo = null
    }

    // Manejo del role
    if (domainEntity.role) {
      persistenceEntity.role = new RoleEntity()
      persistenceEntity.role.id = Number(domainEntity.role.id)
    } else {
      persistenceEntity.role = undefined
    }

    // Manejo del status
    if (domainEntity.status) {
      persistenceEntity.status = new StatusEntity()
      persistenceEntity.status.id = Number(domainEntity.status.id)
    } else {
      persistenceEntity.status = undefined
    }

    // Asignación de fechas
    persistenceEntity.createdAt = domainEntity.createdAt
    persistenceEntity.updatedAt = domainEntity.updatedAt
    persistenceEntity.deletedAt = domainEntity.deletedAt ?? null

    return persistenceEntity
  }
}
