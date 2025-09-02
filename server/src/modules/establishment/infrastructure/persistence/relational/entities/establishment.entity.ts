import {
  Index,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm'
import {
  Accounting,
  EnvironmentType,
} from '@/modules/establishment/establishment.enum'
import { PATH_SOURCE } from '@/common/constants/pathSource.const'
import { EntityRelationalHelper } from '@/utils/relational-entity-helper'
import { FileEntity } from '@/modules/files/infrastructure/persistence/relational/entities/file.entity'

@Entity({ name: PATH_SOURCE.ESTABLISHMENT })
@Index(['ruc'])
@Index(['tradeName'])
export class EstablishmentEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({
    type: 'varchar',
    length: 13,
    unique: true,
    nullable: false,
  })
  ruc: string

  @Column({
    type: 'varchar',
    length: 300,
    nullable: false,
    comment: 'Razón social / nombres o apellidos',
  })
  companyName: string

  @Column({
    type: 'varchar',
    length: 300,
    comment: 'Nombre comercial',
  })
  tradeName: string

  @Column({
    type: 'varchar',
    length: 300,
    nullable: false,
    comment: 'Dirección del establecimiento matriz',
  })
  parentEstablishmentAddress: string

  @Column({
    type: 'enum',
    enum: Accounting,
    comment: 'Obligatorio a llevar contabilidad (Opciones SI o NO)',
  })
  accounting: Accounting

  @OneToOne(() => FileEntity, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  photo?: FileEntity | null

  @Column({
    type: 'enum',
    enum: EnvironmentType,
    nullable: false,
    comment: 'Tipo de ambiente',
  })
  environmentType: EnvironmentType

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date
}
