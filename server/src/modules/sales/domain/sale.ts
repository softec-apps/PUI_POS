import { User } from '@/modules/users/domain/user'
import { SaleItem } from '@/modules/sales/domain/saleItem'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class Sale {
  @ApiProperty({
    type: 'string',
    example: 'a57c798c-3809-4fb2-8331-5a03926ac158',
    description: 'UUID de la venta',
  })
  id: string

  @ApiPropertyOptional({
    type: 'string',
    example: 'e65ee225ee66',
    description: 'Código de  la venta',
  })
  code?: string | null

  @ApiProperty({
    type: 'string',
    example: 'a57c798c-3809-4fb2-8331-5a03926ac158',
    description: 'UUID del cliente',
  })
  customerId: string

  @ApiPropertyOptional({
    type: () => User,
    nullable: true,
    description: 'Cliente asociado a la venta',
  })
  customer?: User | null

  @ApiProperty({
    type: 'number',
    example: 1000.123456,
    description: 'Subtotal de la venta',
  })
  subtotal: number

  @ApiProperty({
    type: 'number',
    example: 15,
    description: 'Tasa de impuesto (%) aplicada a la venta',
  })
  taxRate: number

  @ApiProperty({
    type: 'number',
    example: 150.123456,
    description: 'Monto de impuesto calculado para la venta',
  })
  taxAmount: number

  @ApiProperty({
    type: 'integer',
    example: 1150.123456,
    description: 'Total de la venta',
  })
  total: number

  @ApiProperty({
    type: 'number',
    example: 3,
    description: 'Número total de ítems vendidos',
  })
  totalItems: number

  @ApiProperty({
    type: 'string',
    example: 'cash',
    description: 'Método de pago (cash, transfer, card, etc.)',
  })
  paymentMethod: string

  @ApiProperty({
    type: 'number',
    example: 1200.123456,
    description: 'Monto recibido del cliente',
  })
  receivedAmount: number

  @ApiProperty({
    type: 'number',
    example: 50.123456,
    description: 'Cambio entregado al cliente',
  })
  change: number

  @ApiProperty({
    type: () => [SaleItem],
    description: 'Lista de ítems vendidos en la venta',
  })
  items: SaleItem[]

  @ApiProperty({
    type: 'string',
    example: '2024-08-14T12:00:00.000Z',
    description: 'Fecha de creación de la venta',
  })
  createdAt: Date
}
