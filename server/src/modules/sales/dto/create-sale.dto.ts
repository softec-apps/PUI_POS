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

  @ApiProperty({
    type: 'number',
    example: 50.0,
    description: 'Monto de descuento aplicado al ítem en dinero',
    default: 0,
  })
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: 'El monto de descuento debe ser un número válido' },
  )
  @Min(0, { message: 'El monto de descuento no puede ser negativo' })
  @Transform(({ value }) => Number(Number(value || 0).toFixed(6)))
  discountAmount: number = 0

  @ApiProperty({
    type: 'number',
    example: 10.0,
    description: 'Porcentaje de descuento aplicado al ítem',
    default: 0,
  })
  @IsNumber(
    { allowInfinity: false, allowNaN: false },
    { message: 'El porcentaje de descuento debe ser un número válido' },
  )
  @Min(0, { message: 'El porcentaje de descuento no puede ser negativo' })
  @Transform(({ value }) => Number(Number(value || 0).toFixed(6)))
  discountPercentage: number = 0
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
  @Transform(({ value }) => Number(Number(value).toFixed(6)))
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
}
