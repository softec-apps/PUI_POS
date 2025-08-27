import { ProductEntity } from '@/modules/product/infrastructure/persistence/relational/entities/product.entity'
import { ProductVariationEntity } from '@/modules/product/infrastructure/persistence/relational/entities/product-variant.entity'
import { ProductAttributeValueEntity } from '@/modules/product/infrastructure/persistence/relational/entities/product-attribute-value.entity'
import {
  Product,
  ProductVariation,
  ProductAttributeValue,
} from '@/modules/product/domain/product'
import { FileMapper } from '@/modules/files/infrastructure/persistence/relational/mappers/file.mapper'
import { BrandMapper } from '@/modules/brand/infrastructure/persistence/relational/mappers/brand.mapper'
import { CategoryMapper } from '@/modules/categories/infrastructure/persistence/relational/mappers/category.mapper'
import { SupplierMapper } from '@/modules/suppliers/infrastructure/persistence/relational/mappers/supplier.mapper'
import { TemplateMapper } from '@/modules/template/infrastructure/persistence/relational/mappers/template.mapper'
import { AtributeMapper } from '@/modules/atributes/infrastructure/persistence/relational/mappers/atributes.mapper'

export class ProductMapper {
  static toDomain(raw: ProductEntity): Product {
    const domainEntity = new Product()
    domainEntity.id = raw.id
    domainEntity.isVariant = raw.isVariant
    domainEntity.code = raw.code
    domainEntity.name = raw.name
    domainEntity.description = raw.description
    domainEntity.price = Number(raw.price)
    domainEntity.status = raw.status
    domainEntity.sku = raw.sku
    domainEntity.barCode = raw.barCode
    domainEntity.stock = raw.stock
    domainEntity.tax = raw.tax
    domainEntity.createdAt = raw.createdAt
    domainEntity.updatedAt = raw.updatedAt
    domainEntity.deletedAt = raw.deletedAt

    // Mapear relaciones si están cargadas
    domainEntity.photo = raw.photo ? FileMapper.toDomain(raw.photo) : null

    domainEntity.category = raw.category
      ? CategoryMapper.toDomain(raw.category)
      : null

    domainEntity.brand = raw.brand ? BrandMapper.toDomain(raw.brand) : null

    domainEntity.supplier = raw.supplier
      ? SupplierMapper.toDomain(raw.supplier)
      : null

    domainEntity.template = raw.template
      ? TemplateMapper.toDomain(raw.template)
      : null

    // Mapear variaciones si están cargadas
    if (raw.variations && raw.variations.length > 0) {
      domainEntity.variation = raw.variations.map((vari) =>
        ProductVariationMapper.toDomain(vari),
      )
    }

    // Mapear productos padre si están cargados (para variantes)
    if (raw.parentProducts && raw.parentProducts.length > 0) {
      domainEntity.parentProducts = raw.parentProducts.map((parentProduct) =>
        ProductVariationMapper.toDomain(parentProduct),
      )
    }

    // Mapear valores de atributos si están cargados
    if (raw.attributeValues && raw.attributeValues.length > 0) {
      domainEntity.attributeValues = raw.attributeValues.map((attrValue) =>
        ProductAttributeValueMapper.toDomain(attrValue),
      )
    }

    return domainEntity
  }

  static toPersistence(domainEntity: Product): ProductEntity {
    const persistenceEntity = new ProductEntity()

    persistenceEntity.id = domainEntity.id
    persistenceEntity.isVariant = domainEntity.isVariant
    persistenceEntity.code = domainEntity.code
    persistenceEntity.tax = domainEntity.tax ?? 0
    persistenceEntity.name = domainEntity.name
    persistenceEntity.description = domainEntity.description
    persistenceEntity.price = domainEntity.price
    persistenceEntity.status = domainEntity.status
    persistenceEntity.sku = domainEntity.sku
    persistenceEntity.barCode = domainEntity.barCode
    persistenceEntity.stock = domainEntity.stock
    persistenceEntity.createdAt = domainEntity.createdAt
    persistenceEntity.updatedAt = domainEntity.updatedAt
    persistenceEntity.deletedAt = domainEntity.deletedAt

    // Mapear relaciones si están presentes
    if (domainEntity.photo)
      persistenceEntity.photo = FileMapper.toPersistence(domainEntity.photo)

    if (domainEntity.category)
      persistenceEntity.category = CategoryMapper.toPersistence(
        domainEntity.category,
      )

    if (domainEntity.brand)
      persistenceEntity.brand = BrandMapper.toPersistence(domainEntity.brand)

    if (domainEntity.supplier)
      persistenceEntity.supplier = SupplierMapper.toPersistence(
        domainEntity.supplier,
      )

    if (domainEntity.template) {
      persistenceEntity.template = TemplateMapper.toPersistence(
        domainEntity.template,
      )
    }

    // Mapear variaciones si están presentes
    if (domainEntity.variation)
      persistenceEntity.variations = domainEntity.variation.map((vari) =>
        ProductVariationMapper.toPersistence(vari),
      )

    // Mapear productos padre si están presentes
    if (domainEntity.parentProducts)
      persistenceEntity.parentProducts = domainEntity.parentProducts.map(
        (parentProduct) => ProductVariationMapper.toPersistence(parentProduct),
      )

    // Mapear valores de atributos si están presentes
    if (domainEntity.attributeValues)
      persistenceEntity.attributeValues = domainEntity.attributeValues.map(
        (attrValue) => ProductAttributeValueMapper.toPersistence(attrValue),
      )

    return persistenceEntity
  }
}

export class ProductVariationMapper {
  static toDomain(raw: ProductVariationEntity): ProductVariation {
    const domainEntity = new ProductVariation()
    domainEntity.productId = raw.productId
    domainEntity.productVariantId = raw.productVariantId

    // Mapear relaciones si están cargadas
    if (raw.product) domainEntity.product = ProductMapper.toDomain(raw.product)

    if (raw.productVariant)
      domainEntity.productVariant = ProductMapper.toDomain(raw.productVariant)

    return domainEntity
  }

  static toPersistence(domainEntity: ProductVariation): ProductVariationEntity {
    const persistenceEntity = new ProductVariationEntity()

    persistenceEntity.productId = domainEntity.productId
    persistenceEntity.productVariantId = domainEntity.productVariantId

    if (domainEntity.product)
      persistenceEntity.product = ProductMapper.toPersistence(
        domainEntity.product,
      )

    if (domainEntity.productVariant)
      persistenceEntity.productVariant = ProductMapper.toPersistence(
        domainEntity.productVariant,
      )

    return persistenceEntity
  }
}

export class ProductAttributeValueMapper {
  static toDomain(raw: ProductAttributeValueEntity): ProductAttributeValue {
    const domainEntity = new ProductAttributeValue()
    domainEntity.productId = raw.productId
    domainEntity.attributeId = raw.attributeId
    domainEntity.value = raw.value

    // Mapear relaciones si están cargadas
    if (raw.product) domainEntity.product = ProductMapper.toDomain(raw.product)

    if (raw.attribute)
      domainEntity.atribute = AtributeMapper.toDomain(raw.attribute)

    return domainEntity
  }

  static toPersistence(
    domainEntity: ProductAttributeValue,
  ): ProductAttributeValueEntity {
    const persistenceEntity = new ProductAttributeValueEntity()

    persistenceEntity.productId = domainEntity.productId
    persistenceEntity.attributeId = domainEntity.attributeId
    persistenceEntity.value = domainEntity.value

    if (domainEntity.product)
      persistenceEntity.product = ProductMapper.toPersistence(
        domainEntity.product,
      )

    if (domainEntity.atribute)
      persistenceEntity.attribute = AtributeMapper.toPersistence(
        domainEntity.atribute,
      )

    return persistenceEntity
  }
}
