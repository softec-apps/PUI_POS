import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class CreateProductAttributeValueDto {
  @ApiProperty({
    type: String,
    example: '456e7890-e89b-12d3-a456-426614174111',
    description: 'ID del atributo',
  })
  @IsNotEmpty({ message: 'El ID del atributo es obligatorio' })
  @IsUUID('4', { message: 'El ID del atributo debe ser un UUID válido' })
  attributeId: string

  @ApiProperty({
    type: String,
    example: 'Rojo',
    description: 'Valor del atributo para este producto',
    maxLength: 1000,
  })
  @IsNotEmpty({ message: 'El valor del atributo es obligatorio' })
  @IsString({ message: 'El valor del atributo debe ser texto' })
  @MaxLength(1000, {
    message: 'El valor del atributo debe tener máximo 1000 caracteres',
  })
  value: string
}

// DTO para actualizar múltiples atributos de un producto
export class UpdateProductAttributesDto {
  @ApiProperty({
    type: [CreateProductAttributeValueDto],
    description: 'Array de valores de atributos para el producto',
    isArray: true,
  })
  @IsNotEmpty({ message: 'Los atributos son obligatorios' })
  @IsArray({ message: 'Los atributos deben ser un array' })
  @ArrayMinSize(1, { message: 'Debe proporcionar al menos un atributo' })
  @ValidateNested({ each: true })
  @Type(() => CreateProductAttributeValueDto)
  attributes: CreateProductAttributeValueDto[]
}

// DTO para crear una variante de producto
export class CreateProductVariantDto {
  @ApiProperty({
    type: String,
    example: 'Camiseta Básica Algodón - Talla M - Color Rojo',
    description: 'Nombre específico de la variante',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'El nombre de la variante es obligatorio' })
  @IsString({ message: 'El nombre debe ser texto' })
  @MaxLength(255, { message: 'El nombre debe tener máximo 255 caracteres' })
  name: string

  @ApiPropertyOptional({
    type: String,
    example: 'Variante en color rojo, talla M',
    description: 'Descripción específica de la variante',
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  @MaxLength(2000, {
    message: 'La descripción debe tener máximo 2000 caracteres',
  })
  description?: string | null

  @ApiProperty({
    type: Number,
    example: 32.99,
    description: 'Precio específico de esta variante',
  })
  @IsNotEmpty({ message: 'El precio de la variante es obligatorio' })
  price: number

  @ApiPropertyOptional({
    type: String,
    example: 'CAM-M-ROJO-001',
    description: 'SKU específico de la variante',
    maxLength: 20,
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'El SKU debe ser texto' })
  @MaxLength(20, { message: 'El SKU debe tener máximo 20 caracteres' })
  sku?: string | null

  @ApiPropertyOptional({
    type: String,
    example: '7860001234574',
    description: 'Código de barras específico de la variante',
    maxLength: 50,
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'El código de barras debe ser texto' })
  @MaxLength(50, {
    message: 'El código de barras debe tener máximo 50 caracteres',
  })
  barCode?: string | null

  @ApiProperty({
    type: Number,
    example: 25,
    description: 'Stock específico de esta variante',
    default: 0,
  })
  @IsOptional()
  stock?: number = 0

  @ApiPropertyOptional({
    type: String,
    example: '789e0123-e89b-12d3-a456-426614174222',
    description: 'ID de la foto específica de la variante',
    nullable: true,
  })
  @IsOptional()
  @IsUUID('4', { message: 'El ID de la foto debe ser un UUID válido' })
  photoId?: string | null

  @ApiProperty({
    type: [CreateProductAttributeValueDto],
    description:
      'Valores de atributos específicos de esta variante (ej: color, talla)',
    isArray: true,
  })
  @IsNotEmpty({ message: 'Los atributos de la variante son obligatorios' })
  @IsArray({ message: 'Los atributos deben ser un array' })
  @ArrayMinSize(1, {
    message: 'Debe proporcionar al menos un atributo diferenciador',
  })
  @ValidateNested({ each: true })
  @Type(() => CreateProductAttributeValueDto)
  attributes: CreateProductAttributeValueDto[]
}

// DTO para crear variante con referencia al producto padre
export class CreateProductVariationDto {
  @ApiProperty({
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID del producto base (padre)',
  })
  @IsNotEmpty({ message: 'El ID del producto base es obligatorio' })
  @IsUUID('4', { message: 'El ID del producto debe ser un UUID válido' })
  productId: string

  @ApiProperty({
    type: CreateProductVariantDto,
    description: 'Datos de la variante a crear',
  })
  @IsNotEmpty({ message: 'Los datos de la variante son obligatorios' })
  @ValidateNested()
  @Type(() => CreateProductVariantDto)
  variant: CreateProductVariantDto
}

// DTO para respuesta con producto completo
export class ProductWithVariationsResponseDto {
  @ApiProperty({ description: 'Datos del producto base' })
  product: any // Aquí usarías tu clase Product del dominio

  @ApiProperty({
    description: 'Variaciones del producto',
    isArray: true,
    nullable: true,
  })
  variations?: any[] // Array de productos que son variantes

  @ApiProperty({
    description: 'Valores de atributos del producto',
    isArray: true,
    nullable: true,
  })
  attributeValues?: any[] // Array de ProductAttributeValue
}
