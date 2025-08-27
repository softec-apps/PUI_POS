import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  ValidateNested,
  Min,
} from 'class-validator'

// DTO para descontar stock de un solo producto
export class SingleProductStockDiscountDto {
  @ApiProperty({
    description: 'ID del producto',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID()
  productId: string

  @ApiProperty({
    description: 'Cantidad a descontar del stock',
    example: 5,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity: number

  @ApiProperty({
    description: 'Razón del descuento de stock',
    example: 'Venta realizada',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string

  @ApiProperty({
    description: 'Costo unitario del producto (opcional)',
    example: 25.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  unitCost?: number
}

// DTO para un item en descuento múltiple
export class ProductStockDiscountItemDto {
  @ApiProperty({
    description: 'ID del producto',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID()
  productId: string

  @ApiProperty({
    description: 'Cantidad a descontar del stock',
    example: 3,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity: number

  @ApiProperty({
    description: 'Razón específica del descuento para este producto',
    example: 'Venta item específico',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string

  @ApiProperty({
    description: 'Costo unitario específico para este producto',
    example: 15.75,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  unitCost?: number
}

// DTO para descuento múltiple
export class MultipleProductStockDiscountDto {
  @ApiProperty({
    description: 'Array de productos con sus cantidades a descontar',
    type: [ProductStockDiscountItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductStockDiscountItemDto)
  products: ProductStockDiscountItemDto[]
}

// DTO para verificar stock
export class CheckStockDto {
  @ApiProperty({
    description: 'ID del producto',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID()
  productId: string

  @ApiProperty({
    description: 'Cantidad requerida',
    example: 10,
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity: number
}

// DTO para verificar stock múltiple
export class CheckMultipleStockDto {
  @ApiProperty({
    description: 'Array de productos con las cantidades requeridas',
    type: [CheckStockDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckStockDto)
  products: CheckStockDto[]
}

// DTO para consultar stock actual
export class GetCurrentStockDto {
  @ApiProperty({
    description: 'Array de IDs de productos',
    example: [
      '550e8400-e29b-41d4-a716-446655440000',
      '550e8400-e29b-41d4-a716-446655440001',
    ],
  })
  @IsArray()
  @IsUUID(4, { each: true })
  productIds: string[]
}

// Response DTOs
export class StockDiscountResponseDto {
  @ApiProperty({
    description: 'ID del producto procesado',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  productId: string

  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Laptop Dell Inspiron',
  })
  productName: string

  @ApiProperty({
    description: 'Stock antes del descuento',
    example: 15,
  })
  stockBefore: number

  @ApiProperty({
    description: 'Stock después del descuento',
    example: 12,
  })
  stockAfter: number

  @ApiProperty({
    description: 'Cantidad descontada',
    example: 3,
  })
  quantityDiscounted: number

  @ApiProperty({
    description: 'Indica si la operación fue exitosa',
    example: true,
  })
  success: boolean

  @ApiProperty({
    description: 'Mensaje de error si la operación falló',
    example: 'Stock insuficiente',
    required: false,
  })
  error?: string
}

export class BulkStockDiscountResponseDto {
  @ApiProperty({
    description: 'Productos procesados exitosamente',
    type: [StockDiscountResponseDto],
  })
  successful: StockDiscountResponseDto[]

  @ApiProperty({
    description: 'Productos que fallaron al procesar',
    type: [StockDiscountResponseDto],
  })
  failed: StockDiscountResponseDto[]

  @ApiProperty({
    description: 'Total de productos procesados',
    example: 10,
  })
  totalProcessed: number

  @ApiProperty({
    description: 'Total de productos procesados exitosamente',
    example: 8,
  })
  totalSuccessful: number

  @ApiProperty({
    description: 'Total de productos que fallaron',
    example: 2,
  })
  totalFailed: number
}

export class StockCheckResponseDto {
  @ApiProperty({
    description: 'ID del producto',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  productId: string

  @ApiProperty({
    description: 'Indica si hay stock suficiente',
    example: true,
  })
  hasStock: boolean

  @ApiProperty({
    description: 'Stock actual del producto',
    example: 25,
  })
  currentStock: number

  @ApiProperty({
    description: 'Stock requerido',
    example: 10,
  })
  requiredStock: number

  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Laptop Dell Inspiron',
    required: false,
  })
  productName?: string
}

export class CurrentStockResponseDto {
  @ApiProperty({
    description: 'ID del producto',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  productId: string

  @ApiProperty({
    description: 'Stock actual del producto',
    example: 25,
    nullable: true,
  })
  stock: number | null

  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Laptop Dell Inspiron',
    required: false,
  })
  productName?: string
}
