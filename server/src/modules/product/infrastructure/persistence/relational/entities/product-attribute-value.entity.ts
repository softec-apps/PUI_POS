import {
  Entity,
  Column,
  Unique,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { EntityRelationalHelper } from '@/utils/relational-entity-helper'
import { ProductEntity } from '@/modules/product/infrastructure/persistence/relational/entities/product.entity'
import { AtributeEntity } from '@/modules/atributes/infrastructure/persistence/relational/entities/atribute.entity'

@Entity({ name: 'product_attribute_value' })
@Unique(['product', 'attribute']) // Un producto no puede tener múltiples valores para el mismo atributo
export class ProductAttributeValueEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'text', nullable: false })
  value: string // Valor del atributo (puede ser text, number, boolean, etc. pero se almacena como string)

  // Relación con producto
  @ManyToOne(() => ProductEntity, (product) => product.attributeValues, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  product: ProductEntity

  // Relación con atributo
  @ManyToOne(() => AtributeEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  attribute: AtributeEntity

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}
