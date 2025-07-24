import { Product } from '@/modules/product/domain/product'
import { ProductStatus } from '@/modules/product/status.enum'
import { BrandMapper } from '@/modules/brand/infrastructure/persistence/relational/mappers/brand.mapper'
import { ProductEntity } from '@/modules/product/infrastructure/persistence/relational/entities/product.entity'
import { TemplateMapper } from '@/modules/template/infrastructure/persistence/relational/mappers/template.mapper'
import { SupplierMapper } from '@/modules/suppliers/infrastructure/persistence/relational/mappers/supplier.mapper'
import { CategoryMapper } from '@/modules/categories/infrastructure/persistence/relational/mappers/category.mapper'
import { SupplierEntity } from '@/modules/suppliers/infrastructure/persistence/relational/entities/supplier.entity'

export class ProductMapper {
  static toDomain(raw: ProductEntity): Product {
    const domainEntity = new Product()
    Object.assign(domainEntity, {
      id: raw.id,
      code: raw.code,
      name: raw.name,
      description: raw.description,

      status: (raw.status = Object.values(ProductStatus).includes(raw.status)
        ? raw.status
        : ProductStatus.INACTIVE),

      basePrice: raw.basePrice,
      sku: raw.sku,
      barCode: raw.barCode,
      stock: raw.stock,

      // Mapeo de relaciones
      brand: raw.brand ? BrandMapper.toDomain(raw.brand) : null,
      suppliers: Array.isArray(raw.suppliers)
        ? raw.suppliers.map((attr) =>
            SupplierMapper.toDomain(attr as SupplierEntity),
          )
        : [],
      template: raw.template ? TemplateMapper.toDomain(raw.template) : null,
      category: raw.category ? CategoryMapper.toDomain(raw.category) : null,

      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    })
    return domainEntity
  }

  static toPersistence(domainEntity: Product): ProductEntity {
    const persistenceEntity = new ProductEntity()

    persistenceEntity.id = domainEntity.id
    persistenceEntity.code = domainEntity.code
    persistenceEntity.name = domainEntity.name
    persistenceEntity.description = domainEntity.description

    persistenceEntity.status = Object.values(ProductStatus).includes(
      domainEntity.status as ProductStatus,
    )
      ? (domainEntity.status as ProductStatus)
      : ProductStatus.INACTIVE

    persistenceEntity.basePrice = domainEntity.basePrice
    persistenceEntity.sku = domainEntity.sku
    persistenceEntity.barCode = domainEntity.barCode
    persistenceEntity.stock = domainEntity.stock

    // Mapeo de relaciones
    persistenceEntity.brand = domainEntity.brand
      ? BrandMapper.toPersistence(domainEntity.brand)
      : null

    persistenceEntity.suppliers =
      domainEntity.suppliers && Array.isArray(domainEntity.suppliers)
        ? domainEntity.suppliers.map((supplier) =>
            SupplierMapper.toPersistence(supplier),
          )
        : []

    persistenceEntity.template = domainEntity.template
      ? TemplateMapper.toPersistence(domainEntity.template)
      : null

    persistenceEntity.category = domainEntity.category
      ? CategoryMapper.toPersistence(domainEntity.category)
      : null

    persistenceEntity.createdAt = domainEntity.createdAt
    persistenceEntity.updatedAt = domainEntity.updatedAt
    persistenceEntity.deletedAt = domainEntity.deletedAt

    return persistenceEntity
  }
}
