import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm'
import { AuthProvidersEnum } from '@/modules/auth/auth-providers.enum'
import { EntityRelationalHelper } from '@/utils/relational-entity-helper'
import { RoleEntity } from '@/modules/roles/infrastructure/persistence/relational/entities/role.entity'
import { StatusEntity } from '@/statuses/infrastructure/persistence/relational/entities/status.entity'
import { FileEntity } from '@/modules//files/infrastructure/persistence/relational/entities/file.entity'

@Entity({
  name: 'user',
})
export class UserEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: String, unique: true, nullable: true })
  email: string | null

  @Column({ type: String, unique: true })
  dni: string | null

  @Column({ nullable: true })
  password?: string

  @Column({ default: AuthProvidersEnum.email })
  provider: string

  @Index()
  @Column({ type: String, nullable: true })
  socialId?: string | null

  @Index()
  @Column({ type: String, nullable: true })
  firstName: string | null

  @Index()
  @Column({ type: String, nullable: true })
  lastName: string | null

  @OneToOne(() => FileEntity, {
    eager: true,
  })
  @JoinColumn()
  photo?: FileEntity | null

  @ManyToOne(() => RoleEntity, {
    eager: true,
  })
  role?: RoleEntity | null

  @ManyToOne(() => StatusEntity, {
    eager: true,
  })
  status?: StatusEntity

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}
