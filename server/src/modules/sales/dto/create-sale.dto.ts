import {
  IsUUID,
  IsArray,
  IsString,
  IsNumber,
  Min,
  IsNotEmpty,
  IsOptional,
  ArrayNotEmpty,
  ValidateNested,
  IsIn,
  IsEmpty,
} from 'class-validator'
import { Type, Transform } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

class CreateSaleItemDto {
  @ApiProperty({
    type: String,
    example: 'a3b1f1d6-7b6f-4b72-bf6d-123456789abc',
    description: 'ID del producto (único campo requerido para buscar en BD)',
  })
  @IsNotEmpty({ message: 'El ID del producto es requerido' })
  @IsUUID(4, { message: 'El ID del producto debe ser un UUID válido' })
  productId: string

  @ApiProperty({
    type: Number,
    example: 2,
    description: 'Cantidad solicitada del producto',
    minimum: 1,
  })
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: 'La cantidad debe ser un número válido' },
  )
  @Min(1, { message: 'La cantidad debe ser mayor a 0' })
  @Transform(({ value }) => Number(value))
  quantity: number
}

class PaymentMethodDto {
  @ApiProperty({
    type: String,
    example: 'cash',
    description: 'Método de pago',
    enum: [
      'cash',
      'credit',
      'debit',
      'transfer',
      'check',
      'credit_card',
      'digital',
      'card',
    ],
  })
  @IsNotEmpty({ message: 'El método de pago es requerido' })
  @IsString({ message: 'El método de pago debe ser texto' })
  @IsIn(
    [
      'cash',
      'credit',
      'debit',
      'transfer',
      'check',
      'credit_card',
      'digital',
      'card',
      'other',
    ],
    { message: 'Método de pago no válido' },
  )
  method: string

  @ApiProperty({
    type: Number,
    example: 50.25,
    description: 'Monto del pago',
    minimum: 0,
  })
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: 'El monto debe ser un número válido' },
  )
  @Min(0.01, { message: 'El monto debe ser mayor a 0' })
  @Transform(({ value }) => Number(Number(value).toFixed(2)))
  amount: number

  @ApiPropertyOptional({
    type: String,
    example: 'AAABBC',
    description: 'Número de pago (solo para transferencias)',
  })
  @IsOptional()
  @IsString({ message: 'El número de pago debe ser texto' })
  @Transform(({ value }) => (value ? value.trim() : null))
  transferNumber?: string | null
}

// ✅ NUEVA CLASE: FinancialsDto
class FinancialsDto {
  @ApiProperty({
    type: Number,
    example: 120.0,
    description: 'Subtotal antes de impuestos',
    minimum: 0,
  })
  @IsNotEmpty({ message: 'El subtotal es requerido' })
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: 'El subtotal debe ser un número válido' },
  )
  @Min(0, { message: 'El subtotal no puede ser negativo' })
  @Transform(({ value }) => Number(Number(value).toFixed(2)))
  subtotal: number

  @ApiProperty({
    type: Number,
    example: 18.0,
    description: 'Monto del impuesto aplicado',
    minimum: 0,
  })
  @IsNotEmpty({ message: 'El impuesto es requerido' })
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: 'El impuesto debe ser un número válido' },
  )
  @Min(0, { message: 'El impuesto no puede ser negativo' })
  @Transform(({ value }) => Number(Number(value).toFixed(2)))
  tax: number

  @ApiProperty({
    type: Number,
    example: 0.15,
    description: 'Tasa de impuesto aplicada (0.15 = 15%)',
    minimum: 0,
    maximum: 1,
  })
  @IsNotEmpty({ message: 'La tasa de impuesto es requerida' })
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: 'La tasa de impuesto debe ser un número válido' },
  )
  @Min(0, { message: 'La tasa de impuesto no puede ser negativa' })
  @Transform(({ value }) => Number(Number(value).toFixed(4)))
  taxRate: number

  @ApiProperty({
    type: Number,
    example: 138.0,
    description: 'Total final (subtotal + impuesto)',
    minimum: 0,
  })
  @IsNotEmpty({ message: 'El total es requerido' })
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: 'El total debe ser un número válido' },
  )
  @Min(0, { message: 'El total no puede ser negativo' })
  @Transform(({ value }) => Number(Number(value).toFixed(2)))
  total: number

  @ApiProperty({
    type: Number,
    example: 3,
    description: 'Total de items en la venta',
    minimum: 1,
  })
  @IsNotEmpty({ message: 'El total de items es requerido' })
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: 'El total de items debe ser un número válido' },
  )
  @Min(1, { message: 'Debe haber al menos 1 item' })
  @Transform(({ value }) => Number(value))
  totalItems: number
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
    type: [PaymentMethodDto],
    description: 'Array de métodos de pago utilizados',
    example: [
      {
        id: 'payment_1756947932379_7g7uiqpq6',
        method: 'cash',
        amount: 126,
      },
      {
        id: 'payment_1756947940345_z0uw6pwfz',
        method: 'digital',
        amount: 0.5,
        transferNumber: 'AAABBC',
      },
    ],
  })
  @IsArray({ message: 'Los métodos de pago deben ser un arreglo' })
  @ArrayNotEmpty({ message: 'Debe incluir al menos un método de pago' })
  @ValidateNested({ each: true })
  @Type(() => PaymentMethodDto)
  payments: PaymentMethodDto[]

  @ApiProperty({
    type: [CreateSaleItemDto],
    description: 'Lista de ítems de la venta (solo productId y quantity)',
  })
  @IsArray({ message: 'Los ítems deben ser un arreglo' })
  @ArrayNotEmpty({ message: 'Debe incluir al menos un ítem' })
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[]

  // ✅ NUEVO CAMPO: financials
  @ApiProperty({
    type: FinancialsDto,
    description: 'Datos financieros de la venta calculados en el frontend',
    example: {
      subtotal: 120,
      tax: 18,
      taxRate: 0.15,
      total: 138,
      totalItems: 3,
    },
  })
  @IsNotEmpty({ message: 'Los datos financieros son requeridos' })
  @ValidateNested()
  @Type(() => FinancialsDto)
  financials: FinancialsDto

  // ✅ CAMPO OPCIONAL: receivedAmount (calculado automáticamente desde payments)
  @ApiPropertyOptional({
    type: Number,
    example: 120.0,
    description:
      'Monto total recibido del cliente (calculado automáticamente desde payments)',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: 'El monto recibido debe ser un número válido' },
  )
  @Min(0, { message: 'El monto recibido no puede ser negativo' })
  @Transform(({ value }) =>
    value !== undefined ? Number(Number(value).toFixed(2)) : undefined,
  )
  receivedAmount?: number
}
