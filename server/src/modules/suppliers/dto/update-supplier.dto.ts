import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  Length,
  Matches,
} from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { SupplierStatus } from '@/modules/suppliers/status.enum'

export class UpdateSupplierDto {
  @ApiPropertyOptional({
    type: String,
    example: '1790012345001',
    description: 'RUC del proveedor',
    maxLength: 13,
  })
  @IsOptional()
  @Length(13, 13, { message: 'El RUC debe tener exactamente 13 dígitos' })
  @Matches(/^[0-9]+$/, { message: 'El RUC solo debe contener números' })
  ruc?: string

  @ApiPropertyOptional({
    type: 'string',
    example: 'COMERCIALIZADORA ANDINA S.A.',
    description: 'Razón social (nombre legal)',
    maxLength: 300,
  })
  @IsOptional()
  @IsString({ message: 'La razón social debe ser texto' })
  @MaxLength(300, {
    message: 'La razón social debe tener como máximo 300 caracteres',
  })
  legalName?: string

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

  @ApiPropertyOptional({
    enum: SupplierStatus,
    example: SupplierStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(SupplierStatus, {
    message: `El estado debe ser uno de: ${Object.values(SupplierStatus).join(', ')}`,
  })
  status?: SupplierStatus

  @ApiPropertyOptional({
    type: Date,
    example: '',
    description: 'Fecha removida',
  })
  @IsOptional()
  deletedAt?: Date | null
}
