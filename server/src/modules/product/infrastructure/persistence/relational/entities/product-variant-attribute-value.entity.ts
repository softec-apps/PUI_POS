import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm'
import { EntityRelationalHelper } from '@/utils/relational-entity-helper'
import { AtributeEntity } from '@/modules/atributes/infrastructure/persistence/relational/entities/atribute.entity'
import { ProductVariantEntity } from '@/modules/product/infrastructure/persistence/relational/entities/product-variant.entity'

@Entity({ name: 'product_variant_attribute_value' })
@Unique(['productVariant', 'attribute']) // Una variante no puede tener múltiples valores para el mismo atributo
export class ProductVariantAttributeValueEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'text', nullable: false })
  value: string // Valor del atributo específico para esta variante

  // Relación con variante del producto
  @ManyToOne(() => ProductVariantEntity, (variant) => variant.attributeValues, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  productVariant: ProductVariantEntity

  // Relación con atributo
  @ManyToOne(() => AtributeEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  attribute: AtributeEntity

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}
