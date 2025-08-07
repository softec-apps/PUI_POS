import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Length,
} from 'class-validator'
import { SupplierStatus } from '@/modules/suppliers/status.enum'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEcuadorianRUC } from '@/common/validators/ecuadorian.validator'

export class CreateSupplierDto {
  @ApiProperty({
    type: 'string',
    example: '1790012345001',
    description: 'RUC del proveedor',
    maxLength: 13,
  })
  @IsNotEmpty({ message: 'El RUC es obligatorio' })
  @IsString({ message: 'El RUC debe ser texto' })
  @Length(13, 13, { message: 'El RUC debe tener exactamente 13 caracteres' })
  @IsEcuadorianRUC({ message: 'El RUC no es válido' })
  ruc: string

  @ApiProperty({
    type: 'string',
    example: 'COMERCIALIZADORA ANDINA S.A.',
    description: 'Razón social (nombre legal)',
    maxLength: 300,
  })
  @IsNotEmpty({ message: 'La razón social es obligatoria' })
  @IsString({ message: 'La razón social debe ser texto' })
  @MaxLength(300, {
    message: 'La razón social debe tener como máximo 300 caracteres',
  })
  legalName: string

  @ApiPropertyOptional({
    type: String,
    example: 'DISTRIANDINA',
    description: 'Nombre comercial (opcional)',
    maxLength: 300,
  })
  @IsOptional()
  @IsString({ message: 'El nombre comercial debe ser texto' })
  @MaxLength(300, {
    message: 'El nombre comercial debe tener como máximo 300 caracteres',
  })
  commercialName?: string

  @ApiProperty({
    enum: SupplierStatus,
    example: SupplierStatus.ACTIVE,
    default: SupplierStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(SupplierStatus, {
    message: `El estado debe ser uno de: ${Object.values(SupplierStatus).join(', ')}`,
  })
  status?: SupplierStatus = SupplierStatus.ACTIVE
}
