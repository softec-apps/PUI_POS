import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { EntityRelationalHelper } from '@/utils/relational-entity-helper'
import { ProductEntity } from '@/modules/product/infrastructure/persistence/relational/entities/product.entity'

@Entity({ name: 'product_variation' })
@Index(['productId', 'productVariantId'], { unique: true }) // ✅ Evitar duplicados
@Index(['productId']) // Para consultas de variantes por producto
@Index(['productVariantId']) // Para consultas de producto padre por variante
export class ProductVariationEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string

  // ✅ ID del producto base
  @Column({ type: 'uuid', nullable: false })
  productId: string

  // ✅ ID del producto que es variante
  @Column({ type: 'uuid', nullable: false })
  productVariantId: string

  @ManyToOne(() => ProductEntity, (product) => product.variations, {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'productId' })
  product: ProductEntity

  @ManyToOne(() => ProductEntity, (product) => product.parentProducts, {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'productVariantId' })
  productVariant: ProductEntity
}
