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
import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateCustomerDto {
  @ApiPropertyOptional({
    enum: CustomerType,
    example: CustomerType.REGULAR,
    description: `El tipo de cliente debe ser uno de:
      ${CustomerType.REGULAR} = ${CustomerTypeLabels[CustomerType.REGULAR]},
      ${CustomerType.FINAL_CONSUMER} = ${CustomerTypeLabels[CustomerType.FINAL_CONSUMER]},
    `,
  })
  @IsEnum(CustomerType, { message: 'El tipo de cliente no es válido' })
  @IsOptional()
  customerType?: CustomerType

  @ApiPropertyOptional({
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
  @IsOptional()
  identificationType?: IdentificationType

  @ApiPropertyOptional({
    type: 'string',
    example: '1234567890001',
    description: 'Número de identificación (RUC, CI, etc)',
    maxLength: 13,
  })
  @IsString()
  @IsOptional()
  @MinLength(10, {
    message: 'El número de identificación debe tener al menos 10 dígitos',
  })
  @MaxLength(13, {
    message: 'El número de identificación debe tener como máximo 13 dígitos',
  })
  identificationNumber?: string

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
    description: 'Apellido del cliente',
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
    description: 'Número de teléfono del cliente',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string

  @ApiPropertyOptional({
    type: String,
    example: '123 Main St, Quito',
    description: 'Dirección del cliente',
  })
  @IsString()
  @IsOptional()
  address?: string
}
