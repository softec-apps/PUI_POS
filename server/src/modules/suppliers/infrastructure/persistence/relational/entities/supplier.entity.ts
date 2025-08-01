import {
  Entity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToMany,
} from 'typeorm'
import { SupplierStatus } from '@/modules/suppliers/status.enum'
import { EntityRelationalHelper } from '@/utils/relational-entity-helper'
import { BrandEntity } from '@/modules/brand/infrastructure/persistence/relational/entities/brand.entity'
import { PATH_SOURCE } from '@/common/constants/pathSource.const'

@Entity({ name: PATH_SOURCE.SUPPLIER })
export class SupplierEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({
    type: 'varchar',
    length: 13,
    unique: true,
    nullable: false,
  })
  ruc: string

  @Column({
    type: 'varchar',
    length: 300,
    nullable: false,
  })
  legalName: string

  @Column({
    type: 'varchar',
    length: 300,
    nullable: true,
  })
  commercialName?: string

  @Column({
    type: 'enum',
    enum: SupplierStatus,
    default: SupplierStatus.ACTIVE,
  })
  status: SupplierStatus

  @ManyToMany(() => BrandEntity, (brand) => brand.suppliers)
  brands: BrandEntity[]

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null
}
