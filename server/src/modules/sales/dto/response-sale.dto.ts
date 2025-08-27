import { ApiProperty } from '@nestjs/swagger'

// Información de metadatos de la respuesta
export class MetaDto {
  @ApiProperty({ example: '2025-08-14T07:45:00.000Z' })
  timestamp: string

  @ApiProperty({ example: 'sales' })
  resource: string

  @ApiProperty({ example: 'create' })
  method: string
}

// DTO base genérico para ventas
export class ResponseSaleDto<T = any> {
  @ApiProperty({ example: true })
  success: boolean

  @ApiProperty({ example: 200 })
  statusCode: number

  @ApiProperty({ example: 'Operación completada exitosamente' })
  message: string

  @ApiProperty({ type: () => Object, required: false })
  data?: T

  @ApiProperty({ type: MetaDto })
  meta: MetaDto
}

// DTOs específicos para cada operación CRUD
export class CreateSaleResponseDto<T = any> extends ResponseSaleDto<T> {
  @ApiProperty({ example: true })
  success: boolean = true

  @ApiProperty({ example: 201 })
  statusCode: number = 201

  @ApiProperty({ example: 'Venta creada exitosamente' })
  message: string = 'Venta creada exitosamente'
}

export class FindOneSaleResponseDto<T = any> extends ResponseSaleDto<T> {
  @ApiProperty({ example: true })
  success: boolean = true

  @ApiProperty({ example: 200 })
  statusCode: number = 200

  @ApiProperty({ example: 'Venta obtenida exitosamente' })
  message: string = 'Venta obtenida exitosamente'
}

export class FindAllSaleResponseDto<T = any> extends ResponseSaleDto<T[]> {
  @ApiProperty({ example: true })
  success: boolean = true

  @ApiProperty({ example: 200 })
  statusCode: number = 200

  @ApiProperty({ example: 'Ventas listadas exitosamente' })
  message: string = 'Ventas listadas exitosamente'

  @ApiProperty({ type: [Object] })
  data?: T[]
}
