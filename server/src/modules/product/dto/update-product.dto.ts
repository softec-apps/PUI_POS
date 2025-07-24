import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator'
import { ProductStatus } from '../status.enum'

export class UpdateProductDto {
  @ApiProperty({
    type: String,
    example: 'Camiseta',
    description: 'Nombre del producto',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe ser texto' })
  @MinLength(5, { message: 'El nombre debe tener mínimo 5 caracteres' })
  @MaxLength(255, { message: 'El nombre debe tener máximo 255 caracteres' })
  name: string

  @ApiPropertyOptional({
    type: String,
    example: 'Descripción del producto',
    description: 'Descripción del producto',
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  description?: string | null

  @ApiProperty({
    enum: ProductStatus,
    example: ProductStatus.ACTIVE,
    default: ProductStatus.ACTIVE,
    description: 'Estado del producto',
  })
  @IsOptional()
  @IsEnum(ProductStatus, {
    message: `El estado debe ser uno de: ${Object.values(ProductStatus).join(', ')}`,
  })
  status: ProductStatus = ProductStatus.ACTIVE

  @ApiProperty({
    type: Number,
    example: 29.99,
    description: 'Precio base del producto',
    nullable: true,
  })
  @IsNotEmpty({ message: 'El precio base es obligatorio' })
  @IsNumber({}, { message: 'El precio base debe ser un número' })
  basePrice: number

  @ApiPropertyOptional({
    type: String,
    example: 'CAM-LRG-AZU-M',
    description: 'SKU del producto',
    maxLength: 20,
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'El SKU debe ser texto' })
  @MaxLength(20, { message: 'El SKU debe tener máximo 20 caracteres' })
  sku?: string | null

  @ApiPropertyOptional({
    type: String,
    example: '7860001234567',
    description: 'Código de barras del producto',
    maxLength: 50,
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'El código de barras debe ser texto' })
  @MaxLength(50, {
    message: 'El código de barras debe tener máximo 50 caracteres',
  })
  barcode?: string | null

  @ApiProperty({
    type: Number,
    example: 100,
    description: 'Stock del producto',
    default: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El stock debe ser un número' })
  stock: number

  @ApiPropertyOptional({
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID de la marca del producto',
    nullable: true,
  })
  @IsOptional()
  @IsUUID('4', { message: 'El ID de la marca debe ser un UUID válido' })
  brandId?: string | null

  @ApiPropertyOptional({
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID del template del producto',
    nullable: true,
  })
  @IsOptional()
  @IsUUID('4', { message: 'El ID del template debe ser un UUID válido' })
  templateId?: string | null

  @ApiPropertyOptional({
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID de la categoría del producto',
    nullable: true,
  })
  @IsOptional()
  @IsUUID('4', { message: 'El ID de la categoría debe ser un UUID válido' })
  categoryId?: string | null
}
