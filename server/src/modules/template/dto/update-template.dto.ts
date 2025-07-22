import {
  IsUUID,
  IsArray,
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
  IsNotEmpty,
  ArrayNotEmpty,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { CreateTemplateDto } from '@/modules/template/dto/create-template.dto'
import { ParamCategoryDto } from '@/modules/categories/dto/param-category.dto'
import { Transform } from 'class-transformer'

export class UpdateTemplateDto extends PartialType(CreateTemplateDto) {
  @ApiProperty({
    type: String,
    minLength: 3,
    maxLength: 255,
    example: 'Plantilla de Producto',
    description: 'Nombre de la plantilla',
  })
  @IsOptional()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @MinLength(3, { message: 'Debe tener al menos 3 caracteres' })
  @MaxLength(255, {
    message: 'Debe tener como máximo 255 caracteres',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  name?: string

  @ApiPropertyOptional({
    example: 'Descripción larga de la plantilla',
    type: String,
    minLength: 3,
    maxLength: 1000,
    description: 'Descripción de la plantilla',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MinLength(3, { message: 'Debe tener al menos 3 caracteres' })
  @MaxLength(1000, { message: 'Debe tener como máximo 1000 caracteres' })
  description?: string | null

  @ApiProperty({ type: String })
  @IsNotEmpty({ message: 'La cateogría  no puede estar vacío' })
  @IsUUID(4, {
    message: 'La categoría debe ser un UUID válido',
  })
  categoryId: string

  @ApiProperty({
    type: [String],
    example: ['d7a2d85d-453c-4ed0-a2cf-c2099aafdfe4'],
    description: 'IDs de atributos (mínimo 1)',
  })
  @IsArray({ message: 'Debe ser un array de IDs' })
  @ArrayNotEmpty({ message: 'Debe incluir al menos un ID de atributo' })
  @IsUUID('4', {
    each: true,
    message: 'Cada ID de atributo debe ser un UUIDv4 válido',
  })
  atributeIds: string[]
}
