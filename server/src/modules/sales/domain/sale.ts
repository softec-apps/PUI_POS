import { User } from '@/modules/users/domain/user'
import { SaleItem } from '@/modules/sales/domain/saleItem'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Customer } from '@/modules/customer/domain/customer'

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
    description: 'Código de la venta',
  })
  code?: string | null

  @ApiProperty({
    type: 'string',
    example: 'a57c798c-3809-4fb2-8331-5a03926ac158',
    description: 'UUID del cliente',
  })
  customerId: string

  @ApiPropertyOptional({
    type: () => Customer,
    nullable: true,
    description: 'Cliente asociado a la venta',
  })
  customer?: Customer | null

  @ApiProperty({
    type: 'number',
    example: 1000.123456,
    description: 'Subtotal de la venta',
  })
  subtotal: number

  @ApiProperty({
    type: 'number',
    example: 150.123456,
    description: 'Monto de impuesto calculado para la venta',
  })
  taxAmount: number

  @ApiProperty({
    type: 'number',
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
    type: 'array',
    description: 'Métodos de pago utilizados en la venta',
    example: [
      {
        method: 'cash',
        amount: 1000.0,
      },
      {
        method: 'card',
        amount: 150.123456,
      },
      {
        method: 'digital',
        amount: 5.123456,
      },
    ],
  })
  paymentMethods: Array<{
    method: string
    amount: number
    transferNumber?: string | null
  }>

  @ApiProperty({
    type: 'number',
    example: 1200.123456,
    description: 'Monto total recibido del cliente (suma de todos los pagos)',
  })
  receivedAmount: number

  @ApiProperty({
    type: 'number',
    example: 1200.123456,
    description: 'Descuento de la venta',
  })
  discountAmount: number

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

  @ApiPropertyOptional({
    type: 'string',
    example: 'procesando',
    description: 'Estado comprobante',
  })
  estado_sri: string | null

  @ApiPropertyOptional({
    type: 'string',
    example: '0101011010111110454414',
    description: 'Clave de acceso comprobante SRI',
  })
  clave_acceso: string | null

  @ApiPropertyOptional({
    type: 'string',
    example: 'a57c798c-3809-4fb2-8331-5a03926ac158',
    description: 'UUID del comprobante de Factu Zen',
  })
  comprobante_id?: string | null

  @ApiProperty({
    type: () => User,
    description: 'Usuario que registró la venta',
  })
  user?: User | null

  @ApiPropertyOptional({
    type: 'string',
    example: 'a57c798c-3809-4fb2-8331-5a03926ac158',
    description: 'UUID del usuario',
  })
  userId?: string | null
}
