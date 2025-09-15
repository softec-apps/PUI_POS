import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { PATH_SOURCE } from '@/common/constants/pathSource.const'
import { EntityRelationalHelper } from '@/utils/relational-entity-helper'

import { SaleEntity } from '@/modules/sales/infrastructure/persistence/relational/entities/sale.entity'
import { ProductEntity } from '@/modules/product/infrastructure/persistence/relational/entities/product.entity'
import { Exclude } from 'class-transformer'

@Entity({ name: PATH_SOURCE.SALE_ITEM })
@Index(['productId'])
@Check(`"quantity" > 0`)
@Check(`"unitPrice" >= 0`)
@Check(`"totalPrice" >= 0`)
export class SaleItemEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => SaleEntity, (sale) => sale.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'saleId' })
  sale: SaleEntity

  @Column({ type: 'uuid', nullable: false })
  @Index()
  saleId: string

  @ManyToOne(() => ProductEntity, { onDelete: 'SET NULL', eager: false })
  @JoinColumn({ name: 'productId' })
  product: ProductEntity | null

  @Column({ type: 'uuid', nullable: false })
  @Index()
  productId: string

  @Column({ type: 'varchar', length: 255, nullable: false })
  productName: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  productCode?: string

  @Column({ type: 'int', nullable: false })
  quantity: number

  @Column({
    type: 'decimal',
    precision: 13,
    scale: 6,
    nullable: false,
    default: 0,
  })
  unitPrice: number

  @Exclude()
  @Column({
    type: 'decimal',
    precision: 13,
    scale: 6,
    nullable: false,
    default: 0,
  })
  revenue: number

  @Column({
    type: 'int',
    nullable: false,
    default: 0,
    comment: 'Tasa de impuesto (ej: 15 = 15%)',
  })
  taxRate: number

  @Column({
    type: 'decimal',
    precision: 13,
    scale: 6,
    nullable: false,
    default: 0,
  })
  totalPrice: number

  @Column({
    type: 'decimal',
    precision: 13,
    scale: 6,
    nullable: false,
    default: 0,
  })
  discountAmount: number

  @Column({
    type: 'decimal',
    precision: 13,
    scale: 6,
    nullable: false,
    default: 0,
  })
  discountPercentage: number

  @Column({
    type: 'decimal',
    precision: 13,
    scale: 6,
    nullable: false,
    default: 0,
  })
  taxAmount: number
}
