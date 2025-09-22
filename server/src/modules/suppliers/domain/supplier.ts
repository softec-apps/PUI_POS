import {
  Allow,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator'
import { SupplierStatus } from '@/modules/suppliers/status.enum'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEcuadorianRUC } from '@/common/validators/ecuadorian.validator'
import { Product } from '@/modules/product/domain/product'

export class Supplier {
  @ApiProperty({
    type: String,
    example: '63ee8a88-ed2e-4499-9190-e65ee225ee66',
  })
  id: string

  @ApiProperty({
    type: String,
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
  legalName: string

  @ApiPropertyOptional({
    type: String,
    example: 'DISTRIANDINA',
    description: 'Nombre comercial (opcional)',
    maxLength: 300,
  })
  commercialName?: string

  @ApiPropertyOptional({
    enum: SupplierStatus,
    example: SupplierStatus.ACTIVE,
    description: 'Estado del proveedor',
    default: SupplierStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(SupplierStatus, { message: 'Estado de proveedor no válido' })
  status?: SupplierStatus

  @ApiProperty({
    type: Date,
    example: '2024-06-16T12:34:56.789Z',
    description: 'Fecha de creación',
  })
  createdAt: Date

  @ApiProperty({
    type: Date,
    example: '2024-06-16T15:00:00.000Z',
    description: 'Fecha de última actualización',
  })
  updatedAt: Date

  @ApiPropertyOptional({
    type: Date,
    example: '2024-07-01T09:00:00.000Z',
  })
  deletedAt?: Date | null

  @ApiPropertyOptional({
    type: [Product],
    description: 'Productos asociados a este proveedor',
    nullable: true,
  })
  @IsOptional()
  product?: Product[] | []
}
