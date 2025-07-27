import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsUUID,
  MaxLength,
  MinLength,
  IsEnum,
  IsBoolean,
  IsPositive,
  IsInt,
} from 'class-validator'
import { FileDto } from '@/modules/files/dto/file.dto'
import { ProductStatus } from '@/modules/product/status.enum'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateProductDto {
  @ApiProperty({
    type: Boolean,
    example: false,
    description:
      'Indica si este producto es una variante de otro producto base',
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo isVariant debe ser boolean' })
  isVariant?: boolean = false

  @ApiProperty({
    type: String,
    example: 'Camiseta Básica Algodón',
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
    example: 'Camiseta básica de algodón 100%, perfecta para uso diario',
    description: 'Descripción detallada del producto',
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  @MaxLength(2000, {
    message: 'La descripción debe tener máximo 2000 caracteres',
  })
  description?: string | null

  @ApiProperty({
    enum: ProductStatus,
    example: ProductStatus.DRAFT,
    default: ProductStatus.DRAFT,
    description:
      'Estado inicial del producto (por defecto DRAFT hasta completar configuración)',
  })
  @IsOptional()
  @IsEnum(ProductStatus, {
    message: `El estado debe ser uno de: ${Object.values(ProductStatus).join(', ')}`,
  })
  status?: ProductStatus = ProductStatus.DRAFT

  @ApiPropertyOptional({ type: () => FileDto })
  @IsOptional()
  photo?: FileDto | null

  @ApiProperty({
    type: Number,
    example: 29.99,
    description:
      'Precio base del producto (debe ser un número positivo, máximo 6 decimales)',
  })
  @IsNotEmpty({ message: 'El precio es obligatorio' })
  @IsNumber(
    { allowNaN: false, allowInfinity: false, maxDecimalPlaces: 6 },
    { message: 'El precio debe ser un número válido (máximo 6 decimales)' },
  )
  @IsPositive({ message: 'El precio debe ser un número positivo' })
  price: number

  @ApiPropertyOptional({
    type: String,
    example: 'CAM-LRG-AZU-M',
    description: 'SKU del producto (código de inventario)',
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
  barCode?: string | null

  @ApiProperty({
    type: Number,
    example: 100,
    description: 'Stock inicial del producto (debe ser un entero positivo)',
    default: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El stock debe ser un número' })
  @IsInt({ message: 'El stock debe ser un número entero' })
  @IsPositive({ message: 'El stock debe ser un número positivo' })
  stock?: number = 0

  // Foreign Keys - Relaciones opcionales
  @ApiPropertyOptional({
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID de la categoría del producto',
    nullable: true,
  })
  @IsOptional()
  @IsUUID('4', { message: 'El ID de la categoría debe ser un UUID válido' })
  categoryId?: string | null

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
    description: 'ID del proveedor del producto',
    nullable: true,
  })
  @IsOptional()
  @IsUUID('4', { message: 'El ID del proveedor debe ser un UUID válido' })
  supplierId?: string | null

  @ApiProperty({
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
    description:
      'ID del template que define la estructura de atributos del producto (OBLIGATORIO)',
  })
  @IsNotEmpty({ message: 'El ID del template es obligatorio' })
  @IsUUID('4', { message: 'El ID del template debe ser un UUID válido' })
  templateId: string
}
