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
} from 'class-validator'
import { Type, Transform } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

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
      'other',
    ],
  })
  @IsNotEmpty({ message: 'El método de pago es requerido' })
  @IsString({ message: 'El método de pago debe ser texto' })
  paymentMethod: string

  @ApiProperty({
    type: Number,
    example: 120.0,
    description: 'Monto recibido del cliente (solo requerido para efectivo)',
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
