import { Product } from '@/modules/product/domain/product'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Exclude } from 'class-transformer'

export class SaleItem {
  @ApiProperty({
    type: 'string',
    example: 'c0a80123-4567-890a-bcde-f0123456789a',
    description: 'UUID del ítem de venta',
  })
  id: string

  @ApiProperty({
    type: 'string',
    example: 'e1b45678-9abc-4def-8123-456789abcdef',
    description: 'UUID de la venta a la que pertenece',
  })
  saleId: string

  @ApiPropertyOptional({
    type: () => Product,
    nullable: true,
    description: 'Producto asociado al ítem de venta',
  })
  product?: Product | null

  @ApiProperty({
    type: 'string',
    example: 'Laptop Dell XPS 13',
    description: 'Nombre del producto vendido',
  })
  productName: string

  @ApiProperty({
    type: 'string',
    example: 'PROD-00001',
    description: 'Código del producto',
  })
  productCode: string

  @ApiProperty({
    type: 'integer',
    example: 2,
    description: 'Cantidad vendida',
  })
  quantity: number

  @ApiProperty({
    type: 'number',
    example: 850.123456,
    description: 'Precio unitario del producto',
  })
  unitPrice: number

  @ApiPropertyOptional({
    type: 'number',
    example: 50.123456,
    description: 'Ganancia del producto',
  })
  revenue: number

  @ApiProperty({
    type: 'number',
    example: 15,
    description: 'Tasa de impuesto (%) aplicada al ítem',
  })
  taxRate: number

  @ApiProperty({
    type: 'number',
    example: 1701.123456,
    description: 'Precio total del ítem (incluyendo impuestos)',
  })
  totalPrice: number

  @ApiProperty({
    type: 'number',
    example: 50.0,
    description: 'Monto de descuento aplicado al ítem en dinero',
    default: 0,
  })
  discountAmount: number = 0

  @ApiProperty({
    type: 'number',
    example: 10.0,
    description: 'Porcentaje de descuento aplicado al ítem',
    default: 0,
  })
  discountPercentage: number = 0

  @Exclude()
  @ApiPropertyOptional({
    type: 'number',
    example: 10.0,
    description: 'Total de impuestos',
    default: 0,
  })
  taxAmount: number = 0
}
