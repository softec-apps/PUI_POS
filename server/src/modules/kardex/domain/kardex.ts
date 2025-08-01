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
import { User } from '@/modules/users/domain/user'
import { Product } from '@/modules/product/domain/product'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { KardexMovementType } from '@/modules/kardex/movement-type.enum'

export class Kardex {
  @ApiProperty({
    type: 'string',
    example: 'a2f8971e-2b13-41be-9480-b5e6c5fc3211',
    description: 'ID del registro Kardex',
  })
  @IsNotEmpty()
  @IsString()
  id: string

  @ApiProperty({
    type: () => Product,
    description: 'Producto del movimiento',
  })
  product: Product | null

  @ApiProperty({
    type: 'string',
    enum: KardexMovementType,
    example: KardexMovementType.SALE,
    description: 'Tipo de movimiento en el kardex',
  })
  @IsEnum(KardexMovementType)
  movementType: KardexMovementType

  @ApiProperty({
    type: 'integer',
    example: 10,
    description: 'Cantidad de unidades del producto',
  })
  @IsNumber()
  @IsPositive({ message: 'La cantidad debe ser positiva' })
  quantity: number

  @ApiProperty({
    type: 'number',
    example: 3.123456,
    description: 'Costo unitario del producto, hasta 6 decimales',
  })
  @IsNumber()
  @Min(0)
  unitCost: number

  @ApiProperty({
    type: 'number',
    example: 37.123456,
    description: 'Subtotal calculado (quantity * unitCost)',
  })
  @IsNumber()
  @Min(0)
  subtotal: number

  @ApiProperty({
    type: 'number',
    example: 15.5,
    description:
      'Tasa de impuesto en porcentaje (ej. 15 para 15%) permite hasta 2 decimales',
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  taxRate: number

  @ApiProperty({
    type: 'number',
    example: 5.81,
    description:
      'Monto del impuesto (subtotal * taxRate / 100) hasta 6 decimales',
  })
  @IsNumber()
  @Min(0)
  taxAmount: number

  @ApiProperty({
    type: 'number',
    example: 43.123456,
    description: 'Total final (subtotal + taxAmount), hasta 6 decimales',
  })
  @IsNumber()
  @Min(0)
  total: number

  @ApiProperty({
    type: 'integer',
    example: 100,
    description: 'Stock anterior al movimiento',
  })
  @IsNumber()
  @Min(0)
  stockBefore: number

  @ApiProperty({
    type: 'integer',
    example: 110,
    description: 'Stock posterior al movimiento',
  })
  @IsNumber()
  @Min(0)
  stockAfter: number

  @ApiPropertyOptional({
    type: 'string',
    example: 'Compra al proveedor principal',
    description: 'Razón o justificación del movimiento',
  })
  @IsOptional()
  @IsString()
  reason?: string | null

  @ApiProperty({
    type: () => User,
    description: 'Usuario que registró el movimiento',
  })
  user: User | null

  @ApiProperty({
    type: 'string',
    example: '2024-08-01T12:34:56.000Z',
    description: 'Fecha de creación del registro',
  })
  createdAt: Date

  @ApiProperty({
    type: 'string',
    example: '2024-08-01T14:00:00.000Z',
    description: 'Última fecha de actualización del registro',
  })
  updatedAt: Date
}
