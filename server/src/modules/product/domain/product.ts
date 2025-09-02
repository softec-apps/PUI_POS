import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsUUID,
  Length,
  MaxLength,
  MinLength,
  IsPositive,
  IsInt,
  IsBoolean,
} from 'class-validator'
import { Brand } from '@/modules/brand/domain/brand'
import { FileType } from '@/modules/files/domain/file'
import { Template } from '@/modules/template/domain/template'
import { Supplier } from '@/modules/suppliers/domain/supplier'
import { ProductStatus } from '@/modules/product/status.enum'
import { Category } from '@/modules/categories/domain/category'
import { Atribute } from '@/modules/atributes/domain/atribute'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class Product {
  @ApiProperty({
    type: String,
    example: '63ee8a88-ed2e-4499-9190-e65ee225ee66',
  })
  @IsUUID('4')
  id: string

  @ApiProperty({
    type: Boolean,
    example: 'true',
    description: 'True = Si es un producto variante',
  })
  @IsNotEmpty({ message: 'El isVariant es obligatorio' })
  @IsBoolean({ message: 'El isVariant debe ser boolean' })
  isVariant: boolean

  @ApiProperty({
    type: String,
    example: 'PROD-00001',
    description: 'Código del producto',
    maxLength: 10,
  })
  @IsNotEmpty({ message: 'El código es obligatorio' })
  @IsString({ message: 'El código debe ser texto' })
  @Length(10, 10, { message: 'El código debe tener exactamente 10 caracteres' })
  code: string

  @ApiProperty({
    type: String,
    example: 'Camiseta',
    description: 'Nombre del producto',
    maxLength: 255,
    nullable: false,
    required: true,
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
    required: true,
  })
  @IsOptional()
  @IsEnum(ProductStatus, {
    message: `El estado debe ser uno de: ${Object.values(ProductStatus).join(', ')}`,
  })
  status: ProductStatus = ProductStatus.ACTIVE

  @ApiProperty({
    type: () => FileType,
  })
  photo?: FileType | null

  @ApiProperty({
    type: Number,
    example: 29.123456,
    description: 'Costo (debe ser un número positivo, entero o decimal)',
    nullable: true,
    required: false,
  })
  @IsNotEmpty({ message: 'El costo base es requerido' })
  @IsNumber(
    { allowNaN: false, allowInfinity: false, maxDecimalPlaces: 6 },
    {
      message: 'El costo base debe ser un número válido (máximo 6 decimales)',
    },
  )
  @IsPositive({ message: 'El csoto debe ser un número positivo' })
  price: number

  @ApiProperty({
    type: Number,
    example: 29.123456,
    description:
      'Precio de venta del producto (debe ser un número positivo, entero o decimal)',
    nullable: true,
    required: false,
  })
  @IsNotEmpty({ message: 'El Precio de venta es requerido' })
  @IsNumber(
    { allowNaN: false, allowInfinity: false, maxDecimalPlaces: 6 },
    {
      message:
        'El Precio de venta debe ser un número válido (máximo 6 decimales)',
    },
  )
  @IsPositive({ message: 'El Precio de venta debe ser un número positivo' })
  pricePublic: number

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
  barCode?: string | null

  @ApiProperty({
    type: Number,
    example: 100,
    description: 'Stock del producto (debe ser un entero positivo)',
  })
  @IsNotEmpty({ message: 'El stock es requerido' })
  @IsNumber({}, { message: 'El stock debe ser un número' })
  @IsPositive({ message: 'El stock debe ser un número positivo' })
  @IsInt({ message: 'El stock debe ser un número entero' })
  stock: number

  @ApiProperty({
    type: Number,
    example: 0,
    description: 'Inpuesto (debe ser "0" o "15)',
    default: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El impuesto debe ser un número' })
  @IsInt({ message: 'El impuesto debe ser un número entero' })
  @IsPositive({ message: 'El impuesto debe ser un número positivo' })
  tax?: number = 0

  // Relations
  @ApiPropertyOptional({
    type: () => Brand,
    description: 'Marca del producto',
    nullable: true,
  })
  brand?: Brand | null

  @ApiPropertyOptional({
    type: () => Supplier,
    description: 'Proveedor del producto',
    nullable: true,
  })
  supplier?: Supplier | null

  @ApiPropertyOptional({
    type: () => Template,
    description: 'Template del producto',
    nullable: true,
  })
  template?: Template | null

  @ApiPropertyOptional({
    type: () => Category,
    description: 'Categoría del producto',
    nullable: true,
  })
  category?: Category | null

  // Product variations relationships
  @ApiPropertyOptional({
    type: () => [ProductVariation],
    description: 'Variaciones del producto (si es producto base)',
    isArray: true,
  })
  variation?: ProductVariation[]

  @ApiPropertyOptional({
    type: () => [ProductVariation],
    description: 'Productos padre (si es una variante)',
    isArray: true,
  })
  parentProducts?: ProductVariation[]

  // Attribute values
  @ApiPropertyOptional({
    type: () => [ProductAttributeValue],
    description: 'Valores de atributos del producto',
    isArray: true,
  })
  attributeValues?: ProductAttributeValue[]

  // Timestamps
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

export class ProductVariation {
  @ApiProperty({
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID del producto base',
  })
  @IsNotEmpty({ message: 'El ID del producto base es obligatorio' })
  @IsUUID('4', { message: 'El ID del producto debe ser un UUID válido' })
  productId: string

  @ApiProperty({
    type: String,
    example: '456e7890-e89b-12d3-a456-426614174111',
    description: 'ID del producto que es variante',
  })
  @IsNotEmpty({ message: 'El ID del producto variante es obligatorio' })
  @IsUUID('4', {
    message: 'El ID del producto variante debe ser un UUID válido',
  })
  productVariantId: string

  // Relations
  @ApiPropertyOptional({
    type: () => Product,
    description: 'Producto base',
  })
  product?: Product

  @ApiPropertyOptional({
    type: () => Product,
    description: 'Producto variante',
  })
  productVariant?: Product
}

export class ProductAttributeValue {
  @ApiProperty({
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID del producto',
  })
  @IsNotEmpty({ message: 'El ID del producto es obligatorio' })
  @IsUUID('4', { message: 'El ID del producto debe ser un UUID válido' })
  productId: string

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

  // Relations
  @ApiPropertyOptional({
    type: () => Product,
    description: 'Producto al que pertenece este valor de atributo',
  })
  product?: Product

  @ApiPropertyOptional({
    type: () => Atribute,
    description: 'Atributo al que corresponde este valor',
  })
  atribute?: Atribute
}
