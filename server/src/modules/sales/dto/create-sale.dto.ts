import {
  IsUUID,
  IsArray,
  IsString,
  IsNumber,
  Min,
  Max,
  IsNotEmpty,
  IsOptional,
  ArrayNotEmpty,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

class CreateSaleItemDto {
  @ApiProperty({
    type: String,
    example: 'a3b1f1d6-7b6f-4b72-bf6d-123456789abc',
    description: 'ID del producto',
  })
  @IsNotEmpty({ message: 'El ID del producto es requerido' })
  @IsUUID(4, { message: 'El ID del producto debe ser un UUID válido' })
  productId: string

  @ApiProperty({
    type: String,
    example: 'Camiseta deportiva',
    description: 'Nombre del producto',
  })
  @IsNotEmpty({ message: 'El nombre del producto es requerido' })
  @IsString({ message: 'El nombre del producto debe ser un texto válido' })
  productName: string

  @ApiPropertyOptional({
    type: String,
    example: 'CAM-001',
    description: 'Código del producto',
  })
  @IsOptional()
  @IsString({ message: 'El código debe ser una cadena de texto' })
  productCode?: string

  @ApiProperty({
    type: Number,
    example: 2,
    description: 'Cantidad del producto',
  })
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @Min(1, { message: 'La cantidad debe ser mayor a 0' })
  quantity: number

  @ApiProperty({
    type: Number,
    example: 29.99,
    description: 'Precio unitario del producto',
  })
  @IsNumber({}, { message: 'El precio unitario debe ser un número' })
  @Min(0, { message: 'El precio unitario no puede ser negativo' })
  unitPrice: number

  @ApiProperty({
    type: Number,
    example: 15,
    description: 'Tasa de impuesto en porcentaje',
  })
  @IsNumber({}, { message: 'La tasa de impuesto debe ser un número' })
  @Min(0, { message: 'La tasa de impuesto no puede ser negativa' })
  taxRate: number

  @ApiProperty({
    type: Number,
    example: 59.98,
    description: 'Precio total (cantidad × precio unitario)',
  })
  @IsNumber({}, { message: 'El precio total debe ser un número' })
  @Min(0, { message: 'El precio total no puede ser negativo' })
  totalPrice: number
}

export class CreateSaleDto {
  @ApiProperty({
    type: String,
    example: 'd2b1f1d6-7b6f-4b72-bf6d-123456789abc',
    description: 'ID del cliente',
  })
  @IsNotEmpty({ message: 'El ID del cliente es requerido' })
  @IsUUID(4, { message: 'El ID del cliente debe ser un UUID válido' })
  customerId: string

  @ApiProperty({
    type: Number,
    example: 100.0,
    description: 'Subtotal de la venta',
  })
  @IsNumber({}, { message: 'El subtotal debe ser un número' })
  @Min(0, { message: 'El subtotal no puede ser negativo' })
  subtotal: number

  @ApiProperty({
    type: Number,
    example: 15,
    description: 'Tasa de impuesto en porcentaje',
  })
  @IsNumber({}, { message: 'La tasa de impuesto debe ser un número' })
  @Min(0, { message: 'La tasa de impuesto no puede ser negativa' })
  @Max(100, { message: 'La tasa de impuesto no puede ser mayor a 100' })
  taxRate: number

  @ApiProperty({
    type: Number,
    example: 15.0,
    description: 'Monto de impuesto',
  })
  @IsNumber({}, { message: 'El monto de impuesto debe ser un número' })
  @Min(0, { message: 'El monto de impuesto no puede ser negativo' })
  taxAmount: number

  @ApiProperty({
    type: Number,
    example: 115.0,
    description: 'Total de la venta',
  })
  @IsNumber({}, { message: 'El total debe ser un número' })
  @Min(0, { message: 'El total no puede ser negativo' })
  total: number

  @ApiProperty({
    type: Number,
    example: 3,
    description: 'Número total de ítems vendidos',
  })
  @IsNumber({}, { message: 'El número total de ítems debe ser un número' })
  @Min(0, { message: 'El número total de ítems no puede ser negativo' })
  totalItems: number

  @ApiProperty({
    type: String,
    example: 'cash',
    description: 'Método de pago',
  })
  @IsNotEmpty({ message: 'El método de pago es requerido' })
  @IsString({ message: 'El método de pago debe ser texto' })
  paymentMethod: string

  @ApiProperty({
    type: Number,
    example: 120.0,
    description: 'Monto recibido del cliente',
  })
  @IsNumber({}, { message: 'El monto recibido debe ser un número' })
  @Min(0, { message: 'El monto recibido no puede ser negativo' })
  receivedAmount: number

  @ApiProperty({
    type: Number,
    example: 5.0,
    description: 'Cambio entregado al cliente',
  })
  @IsNumber({}, { message: 'El cambio debe ser un número' })
  @Min(0, { message: 'El cambio no puede ser negativo' })
  change: number

  @ApiProperty({
    type: [CreateSaleItemDto],
    description: 'Lista de ítems de la venta',
  })
  @IsArray({ message: 'Los ítems deben ser un arreglo' })
  @ArrayNotEmpty({ message: 'Debe incluir al menos un ítem' })
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[]
}
