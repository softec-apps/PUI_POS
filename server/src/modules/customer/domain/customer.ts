import {
  IsEnum,
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
} from 'class-validator'
import {
  CustomerType,
  CustomerTypeLabels,
  IdentificationType,
  IdentificationTypeLabels,
} from '@/modules/customer/customer.enum'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class Customer {
  @ApiProperty({
    type: 'string',
    example: '63ee8a88-ed2e-4499-9190-e65ee225ee66',
    description: 'ID del cliente',
  })
  id: string

  @ApiProperty({
    enum: CustomerType,
    example: CustomerType.REGULAR,
    description: `El tipo de cliente debe ser uno de:
      ${CustomerType.REGULAR} = ${CustomerTypeLabels[CustomerType.REGULAR]},
      ${CustomerType.FINAL_CONSUMER} = ${CustomerTypeLabels[CustomerType.FINAL_CONSUMER]},
    `,
    default: CustomerType.REGULAR,
  })
  @IsEnum(CustomerType, { message: 'El tipo de cliente no es válido' })
  customerType?: CustomerType | null

  @ApiProperty({
    enum: IdentificationType,
    example: IdentificationType.RUC,
    description: `
      ${IdentificationType.RUC} = ${IdentificationTypeLabels[IdentificationType.RUC]},
      ${IdentificationType.IDENTIFICATION_CARD} = ${IdentificationTypeLabels[IdentificationType.IDENTIFICATION_CARD]},
      ${IdentificationType.PASSPORT} = ${IdentificationTypeLabels[IdentificationType.PASSPORT]},
      ${IdentificationType.FINAL_CONSUMER} = ${IdentificationTypeLabels[IdentificationType.FINAL_CONSUMER]}
    `,
  })
  @IsEnum(IdentificationType, {
    message: 'El tipo de identificación no es válido',
  })
  identificationType?: IdentificationType | null

  @ApiProperty({
    type: String,
    example: '1234567890001',
    description: 'Número de identificación (RUC, CI, etc.)',
    maxLength: 13,
  })
  @IsString()
  @MinLength(10, {
    message: 'El número de identificación debe tener al menos 10 dígitos',
  })
  @MaxLength(13, {
    message: 'El número de identificación debe tener como máximo 13 dígitos',
  })
  identificationNumber?: string | null

  @ApiPropertyOptional({
    type: 'string',
    example: 'John',
    description: 'Nombre del cliente',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  firstName?: string | null

  @ApiPropertyOptional({
    type: 'string',
    example: 'Doe',
    description: 'Apellido del cliente',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  lastName?: string | null

  @ApiPropertyOptional({
    type: 'string',
    example: 'john.doe@example.com',
    description: 'Correo electrónico del cliente',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  email?: string | null

  @ApiPropertyOptional({
    type: 'string',
    example: '+593987654321',
    description: 'Número de teléfono del cliente',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string | null

  @ApiPropertyOptional({
    type: 'string',
    example: '123 Main St, Quito',
    description: 'Dirección del cliente',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  address?: string | null

  @ApiProperty({
    type: Date,
    example: '2024-06-16T12:34:56.789Z',
    description: 'Fecha de creación',
  })
  createdAt: Date

  @ApiProperty({
    type: Date,
    example: '2024-06-16T15:00:00.000Z',
    description: 'Fecha de actualización',
  })
  updatedAt: Date

  @ApiPropertyOptional({
    type: Date,
    example: '2024-07-01T09:00:00.000Z',
    description: 'Fecha eliminación',
    nullable: true,
  })
  deletedAt?: Date | null

  // Helper method to check if it's a "Consumidor Final"
  isFinalConsumer(): boolean {
    return (
      this.identificationType === IdentificationType.FINAL_CONSUMER &&
      this.identificationNumber === '9999999999999'
    )
  }

  // Method to get full name or business name appropriately
  getDisplayName(): string {
    if (this.isFinalConsumer()) return 'CONSUMIDOR FINAL'
    return `${this.firstName} ${this.lastName}`.trim()
  }
}
