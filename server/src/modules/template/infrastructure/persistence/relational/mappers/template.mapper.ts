import { Template } from '@/modules/template/domain/template'
import { TemplateEntity } from '@/modules/template/infrastructure/persistence/relational/entities/template.entity'
import { CategoryMapper } from '@/modules/categories/infrastructure/persistence/relational/mappers/category.mapper'
import { AtributeMapper } from '@/modules/atributes/infrastructure/persistence/relational/mappers/atributes.mapper'
import { AtributeEntity } from '@/modules/atributes/infrastructure/persistence/relational/entities/atribute.entity'
import { CategoryEntity } from '@/modules/categories/infrastructure/persistence/relational/entities/category.entity'

export class TemplateMapper {
  static toDomain(raw: TemplateEntity): Template {
    const domainEntity = new Template()
    Object.assign(domainEntity, {
      id: raw.id,
      name: raw.name!,
      description: raw.description ?? null,
      category: raw.category ? CategoryMapper.toDomain(raw.category) : null,
      atributes: Array.isArray(raw.atributes)
        ? raw.atributes.map((attr) =>
            AtributeMapper.toDomain(attr as AtributeEntity),
          )
        : [],
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    })
    return domainEntity
  }

  static toPersistence(domainEntity: Template): TemplateEntity {
    const persistenceEntity = new TemplateEntity()
    Object.assign(persistenceEntity, {
      id: domainEntity.id,
      name: domainEntity.name,
      description: domainEntity.description,
      createdAt: domainEntity.createdAt,
      updatedAt: domainEntity.updatedAt,
    })

    // Manejo de categoría
    if (domainEntity.category) {
      persistenceEntity.category = new CategoryEntity()
      Object.assign(persistenceEntity.category, {
        id: domainEntity.category.id,
        name: domainEntity.category.name!,
        description: domainEntity.category.description,
        createdAt: domainEntity.category.createdAt,
        updatedAt: domainEntity.category.updatedAt,
        deletedAt: domainEntity.category.deletedAt,
      })
    } else {
      persistenceEntity.category = null
    }

    // Manejo de atributos
    persistenceEntity.atributes = Array.isArray(domainEntity.atributes)
      ? domainEntity.atributes.map((attr) => AtributeMapper.toPersistence(attr))
      : []

    return persistenceEntity
  }
}
