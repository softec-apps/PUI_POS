import { EntityRelationalHelper } from '@/utils/relational-entity-helper'
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { ProductEntity } from '@/modules/product/infrastructure/persistence/relational/entities/product.entity'
import { AtributeEntity } from '@/modules/atributes/infrastructure/persistence/relational/entities/atribute.entity'

@Entity({ name: 'product_attribute_value' })
@Index(['productId', 'attributeId'], { unique: true }) // ✅ Un producto no puede tener múltiples valores para el mismo atributo
@Index(['productId']) // Para consultas por producto
@Index(['attributeId']) // Para consultas por atributo
@Index(['value']) // Para búsquedas por valor
export class ProductAttributeValueEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'uuid', nullable: false })
  productId: string

  @Column({ type: 'uuid', nullable: false })
  attributeId: string

  @Column({ type: 'text', nullable: false })
  value: string

  @ManyToOne(() => ProductEntity, (product) => product.attributeValues, {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'productId' })
  product: ProductEntity

  @ManyToOne(() => AtributeEntity, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'attributeId' })
  attribute: AtributeEntity
}
