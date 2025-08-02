import { Kardex } from '@/modules/kardex/domain/kardex'
import { KardexMovementType } from '@/modules/kardex/movement-type.enum'
import { KardexEntity } from '@/modules/kardex/infrastructure/persistence/relational/entities/kardex.entity'
import { ProductMapper } from '@/modules/product/infrastructure/persistence/relational/mappers/product.mapper'
import { UserMapper } from '@/modules/users/infrastructure/persistence/relational/mappers/user.mapper'

export class KardexMapper {
  static toDomain(raw: KardexEntity): Kardex {
    const domainEntity = new Kardex()

    domainEntity.id = raw.id

    domainEntity.product = raw.product
      ? ProductMapper.toDomain(raw.product)
      : null

    domainEntity.movementType = Object.values(KardexMovementType).includes(
      raw.movementType,
    )
      ? raw.movementType
      : KardexMovementType.PURCHASE

    domainEntity.quantity = raw.quantity
    domainEntity.unitCost = Number(raw.unitCost)
    domainEntity.subtotal = Number(raw.subtotal)
    domainEntity.taxRate = Number(raw.taxRate)
    domainEntity.taxAmount = Number(raw.taxAmount)
    domainEntity.total = Number(raw.total)
    domainEntity.stockBefore = raw.stockBefore
    domainEntity.stockAfter = raw.stockAfter
    domainEntity.reason = raw?.reason

    domainEntity.user = raw.user ? UserMapper.toDomain(raw.user) : null

    domainEntity.createdAt = raw.createdAt
    domainEntity.updatedAt = raw.updatedAt

    return domainEntity
  }

  static toPersistence(domainEntity: Kardex): KardexEntity {
    const persistenceEntity = new KardexEntity()

    persistenceEntity.id = domainEntity.id

    if (domainEntity.product)
      persistenceEntity.product = ProductMapper.toPersistence(
        domainEntity.product,
      )

    persistenceEntity.movementType = Object.values(KardexMovementType).includes(
      domainEntity.movementType as KardexMovementType,
    )
      ? (domainEntity.movementType as KardexMovementType)
      : KardexMovementType.PURCHASE

    persistenceEntity.quantity = domainEntity.quantity
    persistenceEntity.unitCost = domainEntity.unitCost
    persistenceEntity.subtotal = domainEntity.subtotal
    persistenceEntity.taxRate = domainEntity.taxRate
    persistenceEntity.taxAmount = domainEntity.taxAmount
    persistenceEntity.total = domainEntity.total
    persistenceEntity.stockBefore = domainEntity.stockBefore
    persistenceEntity.stockAfter = domainEntity.stockAfter
    persistenceEntity.reason = domainEntity.reason

    if (domainEntity.user)
      persistenceEntity.user = UserMapper.toPersistence(domainEntity.user)

    persistenceEntity.createdAt = domainEntity.createdAt
    persistenceEntity.updatedAt = domainEntity.updatedAt

    return persistenceEntity
  }
}
