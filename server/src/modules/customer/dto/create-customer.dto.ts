import {
  IsEnum,
  IsString,
  MaxLength,
  MinLength,
  IsNotEmpty,
  IsOptional,
} from 'class-validator'
import {
  CustomerType,
  CustomerTypeLabels,
  IdentificationType,
  IdentificationTypeLabels,
} from '@/modules/customer/customer.enum'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateCustomerDto {
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
  @IsNotEmpty({ message: 'Se requiere el tipo el tipo de cliente' })
  customerType: CustomerType

  @ApiProperty({
    enum: IdentificationType,
    example: IdentificationType.RUC,
    description: `El tipo de identificación debe ser uno de:
      ${IdentificationType.RUC} = ${IdentificationTypeLabels[IdentificationType.RUC]},
      ${IdentificationType.IDENTIFICATION_CARD} = ${IdentificationTypeLabels[IdentificationType.IDENTIFICATION_CARD]},
      ${IdentificationType.PASSPORT} = ${IdentificationTypeLabels[IdentificationType.PASSPORT]},
      ${IdentificationType.FINAL_CONSUMER} = ${IdentificationTypeLabels[IdentificationType.FINAL_CONSUMER]}
    `,
  })
  @IsEnum(IdentificationType, {
    message: 'El tipo de identificación no es válido',
  })
  @IsNotEmpty({ message: 'Se requiere el tipo de identificación' })
  identificationType: IdentificationType

  @ApiProperty({
    type: 'string',
    example: '1234567890001',
    description: 'Número de identificación (RUC, CI, etc)',
    maxLength: 13,
  })
  @IsString()
  @IsNotEmpty({ message: 'Se requiere número de identificación' })
  @MinLength(10, {
    message: 'El número de identificación debe tener al menos 10 dígitos',
  })
  @MaxLength(13, {
    message: 'El número de identificación debe tener como máximo 13 dígitos',
  })
  identificationNumber: string

  @ApiPropertyOptional({
    type: 'string',
    example: 'John',
    description: 'Nombre del cliente',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  firstName?: string

  @ApiPropertyOptional({
    type: 'string',
    example: 'Doe',
    description: 'Last name of the customer (if individual)',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  lastName?: string

  @ApiPropertyOptional({
    type: String,
    example: 'john.doe@example.com',
    description: 'Correo electrónico del cliente',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  email?: string

  @ApiPropertyOptional({
    type: String,
    example: '+593987654321',
    description: 'Customer phone number',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string

  @ApiPropertyOptional({
    type: String,
    example: '123 Main St, Quito',
    description: 'Customer address',
  })
  @IsString()
  @IsOptional()
  address?: string
}
