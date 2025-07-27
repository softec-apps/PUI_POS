import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Generated,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { ProductStatus } from '@/modules/product/status.enum'
import { PATH_SOURCE } from '@/common/constants/pathSource.const'
import { EntityRelationalHelper } from '@/utils/relational-entity-helper'

import { FileEntity } from '@/modules/files/infrastructure/persistence/relational/entities/file.entity'
import { BrandEntity } from '@/modules/brand/infrastructure/persistence/relational/entities/brand.entity'
import { TemplateEntity } from '@/modules/template/infrastructure/persistence/relational/entities/template.entity'
import { SupplierEntity } from '@/modules/suppliers/infrastructure/persistence/relational/entities/supplier.entity'
import { CategoryEntity } from '@/modules/categories/infrastructure/persistence/relational/entities/category.entity'
import { ProductVariationEntity } from '@/modules/product/infrastructure/persistence/relational/entities/product-variant.entity'
import { ProductAttributeValueEntity } from '@/modules/product/infrastructure/persistence/relational/entities/product-attribute-value.entity'

@Entity({ name: PATH_SOURCE.PRODUCT })
@Index(['isVariant']) // ✅ Separar productos base de variantes
@Index(['status', 'deletedAt']) // Para consultas por estado
@Index(['categoryId', 'status']) // Para filtros por categoría
@Index(['brandId', 'status']) // Para filtros por marca
@Index(['templateId', 'status']) // Para consultas por template
@Index(['code']) // Búsquedas por código
@Index(['name']) // Búsquedas por nombre
@Index(['sku']) // Búsquedas por SKU
@Index(['barCode']) // Búsquedas por código de barras
@Check(`"price" >= 0`) // Validación de precio
@Check(`"stock" >= 0`) // Validación de stock
export class ProductEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({
    type: 'integer',
    unique: true,
    comment: 'Secuencia autoincremental para generar código único',
  })
  @Generated('increment')
  sequence: number

  @Column({
    type: 'boolean',
    default: false,
    comment: 'true = es una variante, false = es producto base',
  })
  isVariant: boolean

  @Column({
    type: 'varchar',
    length: 20,
    unique: true,
    nullable: false,
  })
  code: string

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name: string

  @Column({ type: 'text', nullable: true })
  description?: string | null

  @OneToOne(() => FileEntity, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  photo?: FileEntity | null

  @Column({
    type: 'decimal',
    precision: 13,
    scale: 6,
    nullable: false,
  })
  price: number

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
  })
  status: ProductStatus

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
  barCode?: string | null

  @Column({
    type: 'int',
    nullable: false,
    default: 0,
  })
  stock: number

  // ✅ RELACIONES - Solo para productos base (no variantes)
  @Column({ type: 'uuid', nullable: true })
  @Index()
  categoryId?: string | null

  @ManyToOne(() => CategoryEntity, { onDelete: 'SET NULL', eager: false })
  @JoinColumn({ name: 'categoryId' })
  category?: CategoryEntity | null

  @Column({ type: 'uuid', nullable: true })
  @Index()
  brandId?: string | null

  @ManyToOne(() => BrandEntity, { onDelete: 'SET NULL', eager: false })
  @JoinColumn({ name: 'brandId' })
  brand?: BrandEntity | null

  @Column({ type: 'uuid', nullable: true })
  @Index()
  supplierId?: string | null

  @ManyToOne(() => SupplierEntity, { onDelete: 'SET NULL', eager: false })
  @JoinColumn({ name: 'supplierId' })
  supplier?: SupplierEntity | null

  // ✅ Template obligatorio para definir estructura dinámica
  @Column({ type: 'uuid', nullable: false })
  @Index()
  templateId: string

  @ManyToOne(() => TemplateEntity, { onDelete: 'RESTRICT', eager: false })
  @JoinColumn({ name: 'templateId' })
  template: TemplateEntity

  // ✅ RELACIÓN CONSIGO MISMO: Variantes del producto
  @OneToMany(() => ProductVariationEntity, (variation) => variation.product, {
    cascade: true,
    eager: false,
  })
  variations: ProductVariationEntity[]

  // ✅ RELACIÓN CONSIGO MISMO: Si es variante, referencia al producto padre
  @OneToMany(
    () => ProductVariationEntity,
    (variation) => variation.productVariant,
    {
      eager: false,
    },
  )
  parentProducts: ProductVariationEntity[]

  // ✅ Valores de atributos del producto/variante
  @OneToMany(
    () => ProductAttributeValueEntity,
    (attrValue) => attrValue.product,
    {
      cascade: true,
      eager: false,
    },
  )
  attributeValues: ProductAttributeValueEntity[]

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt?: Date | null
}
