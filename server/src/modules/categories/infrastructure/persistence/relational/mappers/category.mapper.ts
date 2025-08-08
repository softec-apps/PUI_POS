import { Category } from '@/modules/categories/domain/category'
import { CategoryStatus } from '@/modules/categories/category-status.enum'
import { FileMapper } from '@/modules/files/infrastructure/persistence/relational/mappers/file.mapper'
import { FileEntity } from '@/modules/files/infrastructure/persistence/relational/entities/file.entity'
import { CategoryEntity } from '@/modules/categories/infrastructure/persistence/relational/entities/category.entity'

export class CategoryMapper {
  static toDomain(raw: CategoryEntity): Category {
    const domainEntity = new Category()

    domainEntity.id = raw.id
    domainEntity.name = raw.name
    domainEntity.description = raw.description

    // Manejo más seguro de la foto
    domainEntity.photo = raw.photo ? FileMapper.toDomain(raw.photo) : null

    // Validación del status contra el enum
    domainEntity.status = Object.values(CategoryStatus).includes(raw.status)
      ? raw.status
      : CategoryStatus.INACTIVE // Valor por defecto si no es válido

    domainEntity.createdAt = raw.createdAt
    domainEntity.updatedAt = raw.updatedAt
    domainEntity.deletedAt = raw.deletedAt

    return domainEntity
  }

  static toPersistence(domainEntity: Category): CategoryEntity {
    const persistenceEntity = new CategoryEntity()

    // Asignación directa de propiedades básicas
    persistenceEntity.id = domainEntity.id
    persistenceEntity.name = domainEntity.name
    persistenceEntity.description = domainEntity.description

    // Manejo de la foto
    if (domainEntity.photo) {
      persistenceEntity.photo = new FileEntity()
      persistenceEntity.photo.id = domainEntity.photo.id
      persistenceEntity.photo.path = domainEntity.photo.path
    } else {
      persistenceEntity.photo = null
    }

    // Validación del status
    persistenceEntity.status = Object.values(CategoryStatus).includes(
      domainEntity.status as CategoryStatus,
    )
      ? (domainEntity.status as CategoryStatus)
      : CategoryStatus.INACTIVE

    // Asignación de fechas
    persistenceEntity.createdAt = domainEntity.createdAt
    persistenceEntity.updatedAt = domainEntity.updatedAt
    persistenceEntity.deletedAt = domainEntity.deletedAt ?? null

    return persistenceEntity
  }
}
