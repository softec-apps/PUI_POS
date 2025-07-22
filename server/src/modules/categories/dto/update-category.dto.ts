import {
  IsEnum,
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
  IsNotEmpty,
} from 'class-validator'
import { FileDto } from '@/modules/files/dto/file.dto'
import { PartialType, ApiPropertyOptional } from '@nestjs/swagger'
import { CategoryStatus } from '@/modules/categories/category-status.enum'
import { CreateCategoryDto } from '@/modules/categories/dto/create-category.dto'

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @ApiPropertyOptional({
    example: 'Categoría uno',
    type: String,
    minLength: 6,
    maxLength: 255,
  })
  //@Transform(lowerCaseTransformer)
  @IsNotEmpty({ message: 'El nombre no puede estar vacio' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(255, {
    message: 'El nombre debe tener como máximo 255 caracteres',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  name?: string | null

  @ApiPropertyOptional({
    example: 'Descripción de la categoría uno',
    minLength: 6,
    maxLength: 255,
  })
  @IsOptional()
  @MinLength(3, { message: 'La descripción debe tener al menos 3 caracteres' })
  @MaxLength(255, {
    message: 'La descripción debe tener como máximo 255 caracteres',
  })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  description?: string | null

  @ApiPropertyOptional({ type: () => FileDto })
  @IsOptional()
  photo?: FileDto | null

  @ApiPropertyOptional({
    enum: CategoryStatus,
    example: CategoryStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(CategoryStatus, {
    message: `El estado debe ser uno de los siguientes valores: ${Object.values(CategoryStatus).join(', ')}`,
  })
  status?: CategoryStatus

  @ApiPropertyOptional({
    type: Date,
    example: '',
    description: 'Fecha removida',
  })
  @IsOptional()
  deletedAt?: Date | null
}
