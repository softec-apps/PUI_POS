import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { KardexMovementType } from '@/modules/kardex/movement-type.enum'
import { PATH_SOURCE } from '@/common/constants/pathSource.const'
import { EntityRelationalHelper } from '@/utils/relational-entity-helper'

import { ProductEntity } from '@/modules/product/infrastructure/persistence/relational/entities/product.entity'
import { UserEntity } from '@/modules/users/infrastructure/persistence/relational/entities/user.entity'

@Entity({ name: PATH_SOURCE.KARDEX })
@Index(['productId', 'movementType']) // Para filtros por categoría
@Index(['userId', 'movementType']) // Para filtros por marca
@Index(['movementType']) // Para filtros por tipo
@Check(`"quantity" > 0`) // Validación de cantidad positiva
@Check(`"unitCost" >= 0`) // Validación de costo unitario
@Check(`"subtotal" >= 0`) // Validación de subtotal
@Check(`"taxRate" >= 0 AND "taxRate" <= 1`) // Validación de tasa de impuesto (0 a 100%)
@Check(`"taxAmount" >= 0`) // Validación de monto de impuesto
@Check(`"total" >= 0`) // Validación de total
@Check(`"stockBefore" >= 0`) // Validación de stock anterior
@Check(`"stockAfter" >= 0`) // Validación de stock posterior
export class KardexEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({
    type: 'enum',
    enum: KardexMovementType,
    nullable: false,
  })
  movementType: KardexMovementType

  @Column({
    type: 'int',
    nullable: false,
    comment: 'Cantidad en unidades (ej: 8 unidades)',
  })
  quantity: number

  @Column({
    type: 'decimal',
    precision: 13,
    scale: 6,
    nullable: false,
    default: 0,
    comment: 'Costo unitario del producto',
  })
  unitCost: number

  @Column({
    type: 'decimal',
    precision: 13,
    scale: 6,
    nullable: false,
    default: 0,
    comment: 'Subtotal (quantity * unitCost) - calculado automáticamente',
  })
  subtotal: number

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: false,
    default: 0,
    comment: 'Tasa de impuesto en porcentaje (ej: 15.50 para 15.5%)',
  })
  taxRate: number

  @Column({
    type: 'decimal',
    precision: 13,
    scale: 6,
    nullable: false,
    default: 0,
    comment:
      'Monto del impuesto (subtotal * taxRate) - calculado automáticamente',
  })
  taxAmount: number

  @Column({
    type: 'decimal',
    precision: 13,
    scale: 6,
    nullable: false,
    default: 0,
    comment: 'Total final (subtotal + taxAmount) - calculado automáticamente',
  })
  total: number

  @Column({
    type: 'int',
    nullable: false,
    default: 0,
    comment: 'Stock en unidades antes del movimiento',
  })
  stockBefore: number

  @Column({
    type: 'int',
    nullable: false,
    default: 0,
    comment: 'Stock en unidades después del movimiento',
  })
  stockAfter: number

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  reason?: string | null

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', eager: false })
  @JoinColumn({ name: 'userId' })
  user: UserEntity

  @Column({ type: 'uuid', nullable: true })
  @Index()
  userId?: string | null

  @ManyToOne(() => ProductEntity, { onDelete: 'SET NULL', eager: false })
  @JoinColumn({ name: 'productId' })
  product: ProductEntity

  @Column({ type: 'uuid', nullable: true })
  @Index()
  productId?: string | null

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date
}
