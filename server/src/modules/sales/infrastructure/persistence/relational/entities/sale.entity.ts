import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { PATH_SOURCE } from '@/common/constants/pathSource.const'
import { EntityRelationalHelper } from '@/utils/relational-entity-helper'

import { CustomerEntity } from '@/modules/customer/infrastructure/persistence/relational/entities/customer.entity'
import { SaleItemEntity } from '@/modules/sales/infrastructure/persistence/relational/entities/saleItem.entity'
import { UserEntity } from '@/modules/users/infrastructure/persistence/relational/entities/user.entity'

@Entity({ name: PATH_SOURCE.SALE })
@Index(['customerId'])
@Check(`"subtotal" >= 0`)
@Check(`"taxAmount" >= 0`)
@Check(`"total" >= 0`)
export class SaleEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    comment: 'Código de la venta',
  })
  code?: string | null

  @ManyToOne(() => CustomerEntity, { onDelete: 'SET NULL', eager: false })
  @JoinColumn({ name: 'customerId' })
  customer: CustomerEntity | null

  @Column({ type: 'uuid', nullable: false })
  @Index()
  customerId: string

  @Column({
    type: 'decimal',
    precision: 13,
    scale: 6,
    nullable: false,
    default: 0,
    comment: 'Subtotal de la venta',
  })
  subtotal: number

  @Column({
    type: 'decimal',
    precision: 13,
    scale: 6,
    nullable: false,
    default: 0,
    comment: 'Monto de impuesto calculado',
  })
  taxAmount: number

  @Column({
    type: 'decimal',
    precision: 13,
    scale: 6,
    nullable: false,
    default: 0,
    comment: 'Total de la venta',
  })
  total: number

  @Column({
    type: 'decimal',
    precision: 13,
    scale: 6,
    nullable: false,
    default: 0,
    comment: 'Cantidad de descuenti de la venta',
  })
  discountAmount: number

  @Column({
    type: 'int',
    nullable: false,
    default: 0,
    comment: 'Número total de ítems vendidos',
  })
  totalItems: number

  @Column({
    type: 'jsonb',
    nullable: false,
    default: () => "'[]'",
    comment: 'Métodos de pago utilizados en formato JSON',
  })
  paymentMethods: Array<{
    method: string
    amount: number
    transferNumber?: string | null
  }>

  @Column({
    type: 'decimal',
    precision: 13,
    scale: 6,
    nullable: false,
    default: 0,
    comment: 'Monto total recibido del cliente (suma de paymentMethods)',
  })
  receivedAmount: number

  @Column({
    type: 'decimal',
    precision: 13,
    scale: 6,
    nullable: false,
    default: 0,
    comment: 'Cambio entregado al cliente',
  })
  change: number

  @OneToMany(() => SaleItemEntity, (item) => item.sale, {
    cascade: true,
    eager: true,
  })
  items: SaleItemEntity[]

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @Column({
    type: 'varchar',
    length: 50,
    comment: 'Estado comprobante',
  })
  estado_sri?: string | null

  @Column({
    type: 'varchar',
    length: 50,
    comment: 'Clave de acceso comprobante SRI',
  })
  clave_acceso?: string | null

  @Column({
    type: 'varchar',
    length: 50,
    comment: 'UUID del comprobante de Factu Zen',
  })
  comprobante_id?: string | null

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', eager: false })
  @JoinColumn({ name: 'userId' })
  user?: UserEntity | null

  @Column({
    type: 'uuid',
    nullable: true,
    comment: 'UUID del usuario',
  })
  userId?: string | null
}
