import {
  Allow,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator'
import { BrandStatus } from '@/modules/brand/status.enum'
import { Supplier } from '@/modules/suppliers/domain/supplier'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class Brand {
  @ApiProperty({
    type: String,
    example: '63ee8a88-ed2e-4499-9190-e65ee225ee66',
  })
  @Allow()
  id: string

  @ApiProperty({
    type: String,
    example: 'Nike',
    description: 'Nombre de la marca',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(2, { message: 'El nombre debe tener minimo 2 dígitos' })
  @MaxLength(255, { message: 'El nombre debe tener máximo 255 dígitos' })
  name: string

  @ApiPropertyOptional({
    type: String,
    example: 'Marca deportiva',
    description: 'Descripción de la marca',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'El descripción es obligatorio' })
  @MinLength(2, { message: 'El descripción debe tener minimo 2 dígitos' })
  @MaxLength(255, { message: 'El descripción debe tener máximo 255 dígitos' })
  description?: string | null

  @ApiPropertyOptional({
    enum: BrandStatus,
    example: BrandStatus.ACTIVE,
    description: 'Estado del la marca',
    default: BrandStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(BrandStatus, { message: 'Estado de la marca no válido' })
  status?: BrandStatus

  @ApiPropertyOptional({
    type: () => [Supplier],
    nullable: true,
    description: 'Proveedores asociados a la marca',
  })
  suppliers?: Supplier[]

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
    description: 'Fecha de eliminación lógica (si aplica)',
    nullable: true,
  })
  deletedAt?: Date | null
}
