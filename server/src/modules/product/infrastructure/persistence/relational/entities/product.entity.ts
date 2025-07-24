import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
  OneToMany,
} from 'typeorm'
import { ProductStatus } from '@/modules/product/status.enum'
import { EntityRelationalHelper } from '@/utils/relational-entity-helper'
import { BrandEntity } from '@/modules/brand/infrastructure/persistence/relational/entities/brand.entity'
import { TemplateEntity } from '@/modules/template/infrastructure/persistence/relational/entities/template.entity'
import { SupplierEntity } from '@/modules/suppliers/infrastructure/persistence/relational/entities/supplier.entity'
import { CategoryEntity } from '@/modules/categories/infrastructure/persistence/relational/entities/category.entity'
import { ProductVariantEntity } from '@/modules/product/infrastructure/persistence/relational/entities/product-variant.entity'
import { ProductAttributeValueEntity } from '@/modules/product/infrastructure/persistence/relational/entities/product-attribute-value.entity'
import { PATH_SOURCE } from '@/common/constants/pathSource.const'

@Entity({ name: PATH_SOURCE.PRODUCT })
export class ProductEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string

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

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
  })
  status: ProductStatus

  @Column({
    type: 'decimal',
    precision: 13,
    scale: 6,
    nullable: false,
  })
  basePrice: number

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
  })
  stock: number

  // Relación con marca (muchos productos pueden pertenecer a una marca)
  @ManyToOne(() => BrandEntity, { onDelete: 'SET NULL' })
  @JoinColumn()
  brand: BrandEntity | null

  // Relación con proveedores (muchos a muchos)
  @ManyToMany(() => SupplierEntity, { cascade: false })
  @JoinTable({
    name: 'product_supplier',
    joinColumn: { name: 'productId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'supplierId', referencedColumnName: 'id' },
  })
  suppliers: SupplierEntity[]

  // Relación con template (muchos productos pueden usar el mismo template)
  @ManyToOne(() => TemplateEntity, { onDelete: 'SET NULL' })
  @JoinColumn()
  template: TemplateEntity | null

  // Relación con categoría (muchos productos pueden pertenecer a una categoría)
  @ManyToOne(() => CategoryEntity, { onDelete: 'SET NULL' })
  @JoinColumn()
  category: CategoryEntity | null

  // Variantes del producto
  @OneToMany(() => ProductVariantEntity, (variant) => variant.product, {
    cascade: true,
  })
  variants: ProductVariantEntity[]

  // Valores de atributos del producto
  @OneToMany(
    () => ProductAttributeValueEntity,
    (attrValue) => attrValue.product,
    {
      cascade: true,
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
