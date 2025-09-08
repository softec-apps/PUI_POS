import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  ValidateNested,
  IsDateString,
  IsUrl,
  ValidateIf,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class ImpuestoDto {
  @ApiProperty({
    description: 'Código del impuesto (2 = IVA  (15%), 0 = No IVA (0%))',
    example: 2,
  })
  @IsNumber()
  codigo: number

  @ApiProperty({
    description:
      'Código de porcentaje del impuesto (0 = IVA 0%, 2 = IVA 12%, 8 = IVA 15%)',
    example: 8,
  })
  @IsNumber()
  codigoPorcentaje: number

  @ApiProperty({
    description: 'Tarifa del impuesto (%)',
    example: 15,
  })
  @IsNumber()
  tarifa: number

  @ApiProperty({
    description: 'Base imponible para el cálculo del impuesto',
    example: 100.0,
  })
  @IsNumber()
  baseImponible: number

  @ApiProperty({
    description: 'Valor del impuesto calculado',
    example: 15.0,
  })
  @IsNumber()
  valor: number
}

export class DetalleFacturaDto {
  @ApiProperty({
    description: 'Código principal del producto',
    example: 'PROD001',
  })
  @IsString()
  codigoPrincipal: string

  @ApiProperty({
    description: 'Código auxiliar del producto',
    example: 'PROD001',
  })
  @IsString()
  codigoAuxiliar: string

  @ApiProperty({
    description: 'Descripción del producto o servicio',
    example: 'Producto de ejemplo',
  })
  @IsString()
  descripcion: string

  @ApiProperty({
    description: 'Cantidad de productos',
    example: 2,
  })
  @IsNumber()
  cantidad: number

  @ApiProperty({
    description: 'Precio unitario sin impuestos',
    example: 50.0,
  })
  @IsNumber()
  precioUnitario: number

  @ApiProperty({
    description: 'Descuento aplicado',
    example: 0,
  })
  @IsNumber()
  descuento: number

  @ApiProperty({
    description:
      'Precio total sin impuestos (cantidad * precioUnitario - descuento)',
    example: 100.0,
  })
  @IsNumber()
  precioTotalSinImpuesto: number

  @ApiProperty({
    description: 'Array de impuestos aplicados al detalle',
    type: [ImpuestoDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImpuestoDto)
  impuestos: ImpuestoDto[]
}

export class TotalConImpuestosDto {
  @ApiProperty({
    description: 'Código del impuesto (2 = IVA)',
    example: 2,
  })
  @IsNumber()
  codigo: number

  @ApiProperty({
    description: 'Código de porcentaje del IVA (0 = 0%, 2 = 12%, 8 = 15%)',
    example: 2,
  })
  @IsNumber()
  codigoPorcentaje: number

  @ApiProperty({
    description: 'Base imponible del impuesto',
    example: 100.0,
  })
  @IsNumber()
  baseImponible: number

  @ApiProperty({
    description: 'Valor total del impuesto',
    example: 12.0,
  })
  @IsNumber()
  valor: number
}

export class PagoDto {
  @ApiProperty({
    description: 'Forma de pago (01=Efectivo, 20=Crédito, etc.)',
    example: '01',
  })
  @IsString()
  formaPago: string

  @ApiProperty({
    description: 'Total del pago',
    example: 112.0,
  })
  @IsNumber()
  total: number
}

export class InfoAdicionalDto {
  @ApiPropertyOptional({
    description: 'Email del cliente',
    example: 'cliente@example.com',
  })
  @IsOptional()
  @IsString()
  email?: string

  @ApiPropertyOptional({
    description: 'Teléfono del cliente',
    example: '0999999999',
  })
  @IsOptional()
  @IsString()
  telefono?: string | null
}

export class CreateFacturaDto {
  @ApiProperty({
    description:
      'Fecha de emisión (YYYY-MM-DD) - debe ser fecha actual o anterior',
    example: '2025-08-27',
  })
  @IsDateString()
  fechaEmision: string

  @ApiProperty({
    description:
      'Tipo de identificación del comprador (04=RUC, 05=Cédula, 06=Pasaporte, 07=Consumidor final, 08=Exterior)',
    example: '05',
  })
  @IsString()
  tipoIdentificacionComprador: string

  @ApiProperty({
    description: 'Razón social o nombre del comprador',
    example: 'Juan Pérez',
  })
  @IsString()
  razonSocialComprador: string

  @ApiProperty({
    description: 'Número de identificación del comprador',
    example: '1234567890',
  })
  @IsString()
  identificacionComprador: string

  @ApiProperty({
    description: 'Dirección del comprador',
    example: 'Av. Principal 123',
  })
  @IsString()
  direccionComprador: string

  @ApiProperty({
    description: 'Total sin impuestos',
    example: 100.0,
  })
  @IsNumber()
  totalSinImpuestos: number

  @ApiProperty({
    description: 'Total de descuentos aplicados',
    example: 0,
  })
  @IsNumber()
  totalDescuento: number

  @ApiProperty({
    description: 'Array de totales con impuestos (IVA 0%, 12%, 15%)',
    type: [TotalConImpuestosDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TotalConImpuestosDto)
  totalConImpuestos: TotalConImpuestosDto[]

  @ApiProperty({
    description:
      'Importe total de la factura (totalSinImpuestos + impuestos - descuentos)',
    example: 112.0,
  })
  @IsNumber()
  importeTotal: number

  @ApiProperty({
    description: 'Array de formas de pago',
    type: [PagoDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PagoDto)
  pagos: PagoDto[]

  @ApiProperty({
    description: 'Array de detalles de la factura',
    type: [DetalleFacturaDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleFacturaDto)
  detalles: DetalleFacturaDto[]

  @ApiPropertyOptional({
    description: 'Información adicional del cliente (máx. 15 campos)',
    type: InfoAdicionalDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => InfoAdicionalDto)
  infoAdicional?: InfoAdicionalDto

  // 🔥 NUEVOS CAMPOS PARA WEBHOOK/CALLBACK
  @ApiPropertyOptional({
    description:
      'ID único de la venta en el sistema POS (requerido si se usa callbackUrl)',
    example: 'SALE-12345',
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => !!o.callbackUrl)
  saleId?: string | null

  @ApiPropertyOptional({
    description:
      'URL donde recibir notificaciones del estado de la factura (requerido si se usa saleId)',
    example: 'https://mi-pos.com/api/webhooks/factura-status',
  })
  @IsOptional()
  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
  })
  @ValidateIf((o) => !!o.saleId)
  callbackUrl?: string | null
}
