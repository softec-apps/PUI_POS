import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { EntityRelationalHelper } from '@/utils/relational-entity-helper'
import {
  CustomerType,
  CustomerTypeLabels,
  IdentificationType,
  IdentificationTypeLabels,
} from '@/modules/customer/customer.enum'
import { PATH_SOURCE } from '@/common/constants/pathSource.const'

@Entity({ name: PATH_SOURCE.CUSTOMER })
export class CustomerEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({
    type: 'enum',
    enum: CustomerType,
    default: CustomerType.REGULAR,
    comment: `El tipo de cliente debe ser uno de:
      ${CustomerType.REGULAR} = ${CustomerTypeLabels[CustomerType.REGULAR]},
      ${CustomerType.FINAL_CONSUMER} = ${CustomerTypeLabels[CustomerType.FINAL_CONSUMER]},
    `,
  })
  customerType: CustomerType

  @Column({
    type: 'enum',
    enum: IdentificationType,
    comment: `
      ${IdentificationType.RUC} = ${IdentificationTypeLabels[IdentificationType.RUC]},
      ${IdentificationType.IDENTIFICATION_CARD} = ${IdentificationTypeLabels[IdentificationType.IDENTIFICATION_CARD]},
      ${IdentificationType.PASSPORT} = ${IdentificationTypeLabels[IdentificationType.PASSPORT]},
      ${IdentificationType.FINAL_CONSUMER} = ${IdentificationTypeLabels[IdentificationType.FINAL_CONSUMER]}
    `,
  })
  identificationType: string

  @Column({ type: 'varchar', length: 13 })
  identificationNumber: string

  @Column({ type: 'varchar', nullable: true })
  firstName?: string

  @Column({ type: 'varchar', nullable: true })
  lastName?: string

  @Column({ type: 'varchar', nullable: true })
  email?: string

  @Column({ type: 'varchar', nullable: true })
  phone?: string

  @Column({ type: 'text', nullable: true })
  address?: string

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt?: Date | null

  // Helper method to check if it's a "Consumidor Final"
  isFinalConsumer(): boolean {
    return (
      this.identificationType === `${IdentificationType.FINAL_CONSUMER}` &&
      this.identificationNumber === '9999999999999'
    )
  }

  // Method to get full name or business name appropriately
  getDisplayName(): string {
    if (this.isFinalConsumer())
      return `${IdentificationTypeLabels[IdentificationType.FINAL_CONSUMER]}`
    return `${this.firstName} ${this.lastName}`.trim()
  }
}
