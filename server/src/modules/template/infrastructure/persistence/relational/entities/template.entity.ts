import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm'
import { EntityRelationalHelper } from '@/utils/relational-entity-helper'
import { AtributeEntity } from '@/modules/atributes/infrastructure/persistence/relational/entities/atribute.entity'
import { CategoryEntity } from '@/modules/categories/infrastructure/persistence/relational/entities/category.entity'
import { PATH_SOURCE } from '@/common/constants/pathSource.const'

@Entity({ name: PATH_SOURCE.TEMPLATE })
export class TemplateEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', nullable: true })
  name?: string | null

  @Column({ type: 'text', nullable: true })
  description?: string | null

  @OneToOne(() => CategoryEntity, { onDelete: 'SET NULL' })
  @JoinColumn()
  category: CategoryEntity | null

  @ManyToMany(() => AtributeEntity, (atribute) => atribute.template, {
    cascade: true,
  })
  @JoinTable({
    name: 'template_atribute',
    joinColumn: { name: 'templateId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'atributeId', referencedColumnName: 'id' },
  })
  atribute: AtributeEntity[]

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}
