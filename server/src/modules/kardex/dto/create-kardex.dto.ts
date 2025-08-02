import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { KardexMovementType } from '@/modules/kardex/movement-type.enum'

export class CreateKardexDto {
  @ApiProperty({
    type: String,
    example: 'c7e2ddff-d70b-4d7e-8c2c-2de4b0bb6c77',
    description: 'ID del producto',
  })
  @IsNotEmpty()
  @IsString()
  productId: string

  @ApiProperty({
    enum: KardexMovementType,
    example: KardexMovementType.PURCHASE,
    description: 'Tipo de movimiento',
  })
  @IsEnum(KardexMovementType)
  movementType: KardexMovementType

  @ApiProperty({
    type: Number,
    example: 10,
    description: 'Cantidad de unidades del producto',
  })
  @IsNumber()
  @IsPositive({ message: 'La cantidad debe ser positiva' })
  quantity: number

  @ApiProperty({
    type: Number,
    example: 2.345678,
    description: 'Costo unitario del producto',
  })
  @IsNumber()
  @Min(0)
  unitCost: number

  @ApiProperty({
    type: Number,
    example: 23.45678,
    description: 'Subtotal calculado (quantity * unitCost)',
  })
  @IsNumber()
  @Min(0)
  subtotal: number

  @ApiProperty({
    type: Number,
    example: 12.5,
    description: 'Tasa de impuesto en porcentaje (ej. 12.5%)',
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  taxRate: number

  @ApiProperty({
    type: Number,
    example: 2.934,
    description: 'Monto de impuesto (subtotal * taxRate / 100)',
  })
  @IsNumber()
  @Min(0)
  taxAmount: number

  @ApiProperty({
    type: Number,
    example: 26.39078,
    description: 'Total final (subtotal + taxAmount)',
  })
  @IsNumber()
  @Min(0)
  total: number

  @ApiProperty({
    type: Number,
    example: 80,
    description: 'Stock anterior al movimiento',
  })
  @IsNumber()
  @Min(0)
  stockBefore: number

  @ApiProperty({
    type: Number,
    example: 90,
    description: 'Stock posterior al movimiento',
  })
  @IsNumber()
  @Min(0)
  stockAfter: number

  @ApiPropertyOptional({
    type: String,
    example: 'Reposición por compra a proveedor',
    description: 'Razón del movimiento',
  })
  @IsOptional()
  @IsString()
  reason?: string

  @ApiProperty({
    type: String,
    example: 'f4d0a9d1-5f52-4a1e-8f2b-9ac234f3c9a4',
    description: 'ID del usuario que realizó el movimiento',
  })
  @IsNotEmpty()
  @IsString()
  userId: string
}
