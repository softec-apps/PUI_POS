import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator'
import { BrandStatus } from '@/modules/brand/status.enum'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateBrandDto {
  @ApiProperty({
    type: String,
    example: 'Nike',
    description: 'Nombre de la marca',
    maxLength: 13,
  })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe ser texto' })
  @MinLength(2, { message: 'El nombre debe tener exactamente 2 dígitos' })
  @MaxLength(50, { message: 'El nombre debe tener exactamente 50 dígitos' })
  name: string

  @ApiPropertyOptional({
    type: String,
    example: 'Marca deportiva',
    description: 'Descripción de la marca',
    maxLength: 300,
  })
  @IsString({ message: 'La description debe ser texto' })
  @MaxLength(300, {
    message: 'La description debe tener como máximo 300 caracteres',
  })
  description?: string | null

  @ApiProperty({
    enum: BrandStatus,
    example: BrandStatus.ACTIVE,
    default: BrandStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(BrandStatus, {
    message: `El estado debe ser uno de: ${Object.values(BrandStatus).join(', ')}`,
  })
  status: BrandStatus = BrandStatus.ACTIVE
}
