import { ApiProperty } from '@nestjs/swagger'
import { PATH_SOURCE } from '@/common/constants/pathSource.const'

export class MetaDto {
  @ApiProperty({ example: '2025-06-23T19:41:01.120Z' })
  timestamp: string

  @ApiProperty({ example: PATH_SOURCE.KARDEX })
  resource: string

  @ApiProperty({ example: 'create' })
  method: string
}

export class ResponseKardexDto<T = any> {
  @ApiProperty({ example: true })
  success: boolean

  @ApiProperty({ example: 201 })
  statusCode: number

  @ApiProperty({ example: 'Operación completada con éxito' })
  message: string

  @ApiProperty({ type: () => Object, required: false })
  data?: T

  @ApiProperty({ type: MetaDto })
  meta: MetaDto
}

// Specific DTOs for each CRUD operation
export class CreateKardexResponseDto<T = any> extends ResponseKardexDto<T> {
  @ApiProperty({ example: true })
  success: boolean = true

  @ApiProperty({ example: 201 })
  statusCode: number = 201

  @ApiProperty({ example: 'Movimiento registrado exitosamente' })
  message: string = 'Movimiento registrado exitosamente'
}

export class FindOneKardexResponseDto<T = any> extends ResponseKardexDto<T> {
  @ApiProperty({ example: true })
  success: boolean = true

  @ApiProperty({ example: 200 })
  statusCode: number = 200

  @ApiProperty({ example: 'Movimiento recuperado exitosamente' })
  message: string = 'Movimiento recuperado exitosamente'
}

export class FindAllKardexResponseDto<T = any> extends ResponseKardexDto<T[]> {
  @ApiProperty({ example: true })
  success: boolean = true

  @ApiProperty({ example: 200 })
  statusCode: number = 200

  @ApiProperty({ example: 'Movimientos listados exitosamente' })
  message: string = 'Movimientos listados exitosamente'

  @ApiProperty({ type: [Object] })
  data?: T[]
}
