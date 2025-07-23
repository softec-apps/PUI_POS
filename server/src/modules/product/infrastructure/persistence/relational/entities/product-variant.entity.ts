import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm'
import { ProductVariantStatus } from '@/modules/product/status.enum'
import { EntityRelationalHelper } from '@/utils/relational-entity-helper'
import { ProductEntity } from '@/modules/product/infrastructure/persistence/relational/entities//product.entity'
import { ProductVariantAttributeValueEntity } from '@/modules/product/infrastructure/persistence/relational/entities/product-variant-attribute-value.entity'

@Entity({ name: 'product_variant' })
export class ProductVariantEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    nullable: false,
  })
  code: string // Código único de la variante

  @Column({
    type: 'varchar',
    length: 300,
    nullable: false,
  })
  name: string

  @Column({
    type: 'enum',
    enum: ProductVariantStatus,
    default: ProductVariantStatus.ACTIVE,
  })
  status: ProductVariantStatus

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  price?: number | null

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  sku?: string | null

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  barcode?: string | null

  @Column({
    type: 'int',
    default: 0,
  })
  stock: number

  // Relación con producto padre
  @ManyToOne(() => ProductEntity, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  product: ProductEntity

  // Valores de atributos específicos de esta variante
  @OneToMany(
    () => ProductVariantAttributeValueEntity,
    (attrValue) => attrValue.productVariant,
    {
      cascade: true,
    },
  )
  attributeValues: ProductVariantAttributeValueEntity[]

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt?: Date | null
}
