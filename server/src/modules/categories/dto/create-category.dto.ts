import { FileDto } from '@/modules/files/dto/file.dto'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator'
import { CategoryStatus } from '@/modules/categories/category-status.enum'

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Categoria uno',
    type: String,
    minLength: 6,
    maxLength: 255,
  })
  // @Transform(lowerCaseTransformer)
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(255, {
    message: 'El nombre debe tener como máximo 255 caracteres',
  })
  name?: string | null

  @ApiProperty({
    example: 'Descripción de la categoria uno',
    type: String,
    minLength: 6,
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MinLength(3, { message: 'La descripción debe tener al menos 3 caracteres' })
  @MaxLength(255, {
    message: 'La descripción debe tener como máximo 255 caracteres',
  })
  description?: string | null

  @ApiPropertyOptional({ type: () => FileDto })
  @IsOptional()
  photo?: FileDto | null

  @ApiProperty({
    enum: CategoryStatus,
    example: CategoryStatus.ACTIVE,
    default: CategoryStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(CategoryStatus, {
    message: `El estado debe ser uno de: ${Object.values(CategoryStatus).join(', ')}`,
  })
  status?: CategoryStatus = CategoryStatus.ACTIVE
}
