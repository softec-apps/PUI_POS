import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { EntityRelationalHelper } from '@/utils/relational-entity-helper'
import { CategoryStatus } from '@/modules/categories/category-status.enum'
import { FileEntity } from '@/modules/files/infrastructure/persistence/relational/entities/file.entity'
import { PATH_SOURCE } from '@/common/constants/pathSource.const'

@Entity({ name: PATH_SOURCE.CATEGORY })
export class CategoryEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', unique: true, nullable: true })
  name: string | null

  @Column({ type: 'varchar', unique: false, nullable: true })
  description?: string | null

  @OneToOne(() => FileEntity, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  photo?: FileEntity | null

  @Column({
    type: 'enum',
    enum: CategoryStatus,
    default: CategoryStatus.ACTIVE,
  })
  status: CategoryStatus

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null
}
