import {
  Entity,
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { EntityRelationalHelper } from '@/utils/relational-entity-helper'
import { AtributeTypeAllow } from '@/modules/atributes/atribute-types-allow.enum'
import { TemplateEntity } from '@/modules/template/infrastructure/persistence/relational/entities/template.entity'
import { PATH_SOURCE } from '@/common/constants/pathSource.const'

@Entity({ name: PATH_SOURCE.ATRIBUTE })
export class AtributeEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', unique: true, nullable: true })
  name: string | null

  @Column({
    type: 'enum',
    enum: AtributeTypeAllow,
    default: AtributeTypeAllow.TEXT,
  })
  type: AtributeTypeAllow

  @Column({ type: 'json', nullable: true })
  options?: string[]

  @Column({ default: false })
  required: boolean

  @ManyToMany(() => TemplateEntity, (template) => template.atributes)
  templates: TemplateEntity[]

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}
