import { Sale } from '@/modules/sales/domain/sale'
import { SaleItem } from '@/modules/sales/domain/saleItem'
import { SaleEntity } from '@/modules/sales/infrastructure/persistence/relational/entities/sale.entity'
import { SaleItemEntity } from '@/modules/sales/infrastructure/persistence/relational/entities/saleItem.entity'
import { CustomerMapper } from '@/modules/customer/infrastructure/persistence/relational/mappers/customer.mapper'
import { ProductMapper } from '@/modules/product/infrastructure/persistence/relational/mappers/product.mapper'
import { CustomerEntity } from '@/modules/customer/infrastructure/persistence/relational/entities/customer.entity'
import { ProductEntity } from '@/modules/product/infrastructure/persistence/relational/entities/product.entity'

export class SaleItemMapper {
  static toDomain(raw: SaleItemEntity): SaleItem {
    const domainEntity = new SaleItem()
    Object.assign(domainEntity, {
      id: raw.id,
      saleId: raw.saleId,
      product: raw.product ? ProductMapper.toDomain(raw.product) : null,
      productName: raw.productName,
      productCode: raw.productCode ?? null,
      quantity: raw.quantity,
      unitPrice: Number(raw.unitPrice),
      taxRate: raw.taxRate,
      totalPrice: Number(raw.totalPrice),
    })
    return domainEntity
  }

  static toPersistence(domainEntity: SaleItem): SaleItemEntity {
    const persistenceEntity = new SaleItemEntity()
    Object.assign(persistenceEntity, {
      id: domainEntity.id,
      saleId: domainEntity.saleId,
      productName: domainEntity.productName,
      productCode: domainEntity.productCode,
      quantity: domainEntity.quantity,
      unitPrice: domainEntity.unitPrice,
      taxRate: domainEntity.taxRate,
      totalPrice: domainEntity.totalPrice,
    })

    // Manejo de producto
    if (domainEntity.product) {
      persistenceEntity.product = new ProductEntity()
      Object.assign(persistenceEntity.product, {
        id: domainEntity.product.id,
        name: domainEntity.product.name,
        code: domainEntity.product.code,
        description: domainEntity.product.description,
        price: domainEntity.product.price,
        createdAt: domainEntity.product.createdAt,
        updatedAt: domainEntity.product.updatedAt,
        deletedAt: domainEntity.product.deletedAt,
      })
    } else {
      persistenceEntity.product = null
    }

    return persistenceEntity
  }
}

export class SaleMapper {
  static toDomain(raw: SaleEntity): Sale {
    const domainEntity = new Sale()
    Object.assign(domainEntity, {
      id: raw.id,
      code: raw.code,
      customerId: raw.customerId,
      customer: raw.customer ? CustomerMapper.toDomain(raw.customer) : null,
      subtotal: Number(raw.subtotal),
      taxRate: raw.taxRate,
      taxAmount: Number(raw.taxAmount),
      total: Number(raw.total),
      totalItems: raw.totalItems,
      paymentMethod: raw.paymentMethod,
      receivedAmount: Number(raw.receivedAmount),
      change: Number(raw.change),
      items: Array.isArray(raw.items)
        ? raw.items.map((item) => SaleItemMapper.toDomain(item))
        : [],
      createdAt: raw.createdAt,
      // Campos de factus zen
      estado_sri: raw.estado_sri,
      comprobante_id: raw.comprobante_id,
      clave_acceso: raw.clave_acceso,
    })
    return domainEntity
  }

  // SaleMapper.ts
  static toPersistence(domainEntity: Partial<Sale>): SaleEntity {
    const persistenceEntity = new SaleEntity()
    Object.assign(persistenceEntity, {
      id: domainEntity.id ?? undefined,
      code: domainEntity.code,
      customerId: domainEntity.customerId,
      subtotal: domainEntity.subtotal,
      taxRate: domainEntity.taxRate,
      taxAmount: domainEntity.taxAmount,
      total: domainEntity.total,
      totalItems: domainEntity.totalItems,
      paymentMethod: domainEntity.paymentMethod,
      receivedAmount: domainEntity.receivedAmount,
      change: domainEntity.change,
      createdAt: domainEntity.createdAt ?? new Date(),

      estado_sri: domainEntity.estado_sri,
      comprobante_id: domainEntity.comprobante_id,
      clave_acceso: domainEntity.clave_acceso,
    })

    if (domainEntity.customer) {
      persistenceEntity.customer = new CustomerEntity()
      Object.assign(persistenceEntity.customer, {
        id: domainEntity.customer.id,
        firstName: domainEntity.customer.firstName,
        lastName: domainEntity.customer.lastName,
        email: domainEntity.customer.email,
        createdAt: domainEntity.customer.createdAt,
        updatedAt: domainEntity.customer.updatedAt,
        deletedAt: domainEntity.customer.deletedAt,
      })
    } else {
      persistenceEntity.customer = null
    }

    persistenceEntity.items = domainEntity.items
      ? domainEntity.items.map((item) => SaleItemMapper.toPersistence(item))
      : []

    return persistenceEntity
  }
}
