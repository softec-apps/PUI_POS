import { PATH_SOURCE } from '@/common/constants/pathSource.const'
import { ApiProperty } from '@nestjs/swagger'

export class MetaDto {
  @ApiProperty({ example: '2025-06-23T19:41:01.120Z' })
  timestamp: string

  @ApiProperty({ example: PATH_SOURCE.ATRIBUTE })
  resource: string

  @ApiProperty({ example: 'create' })
  method: string
}

// DTO base genérico
export class ResponseAtributeDto<T = any> {
  @ApiProperty({ example: true })
  success: boolean

  @ApiProperty({ example: 201 })
  statusCode: number

  @ApiProperty({ example: 'Operación completada exitosamente' })
  message: string

  @ApiProperty({ type: () => Object, required: false })
  data?: T

  @ApiProperty({ type: MetaDto })
  meta: MetaDto
}

// DTOs específicos para cada operación CRUD
export class CreateAtributeResponseDto<T = any> extends ResponseAtributeDto<T> {
  @ApiProperty({ example: true })
  success: boolean = true

  @ApiProperty({ example: 201 })
  statusCode: number = 201

  @ApiProperty({ example: 'Atributo creado exitosamente' })
  message: string = 'Atributo creado exitosamente'
}

export class UpdateAtributeResponseDto<T = any> extends ResponseAtributeDto<T> {
  @ApiProperty({ example: true })
  success: boolean = true

  @ApiProperty({ example: 200 })
  statusCode: number = 200

  @ApiProperty({ example: 'Atributo actualizado exitosamente' })
  message: string = 'Atributo actualizado exitosamente'
}

export class FindOneAtributeResponseDto<
  T = any,
> extends ResponseAtributeDto<T> {
  @ApiProperty({ example: true })
  success: boolean = true

  @ApiProperty({ example: 200 })
  statusCode: number = 200

  @ApiProperty({ example: 'Atributo obtenido exitosamente' })
  message: string = 'Atributo obtenido exitosamente'
}

export class FindAllAtributeResponseDto<T = any> extends ResponseAtributeDto<
  T[]
> {
  @ApiProperty({ example: true })
  success: boolean = true

  @ApiProperty({ example: 200 })
  statusCode: number = 200

  @ApiProperty({ example: 'Atributos obtenidos exitosamente' })
  message: string = 'Atributos obtenidos exitosamente'

  @ApiProperty({ type: [Object] })
  data?: T[]
}

export class DeleteAtributeResponseDto<T = any> extends ResponseAtributeDto<T> {
  @ApiProperty({ example: true })
  success: boolean = true

  @ApiProperty({ example: 200 })
  statusCode: number = 200

  @ApiProperty({ example: 'Atributo eliminado exitosamente' })
  message: string = 'Atributo eliminado exitosamente'
}

export class HardDeleteAtributeResponseDto<
  T = any,
> extends ResponseAtributeDto<T> {
  @ApiProperty({ example: true })
  success: boolean = true

  @ApiProperty({ example: 200 })
  statusCode: number = 200

  @ApiProperty({ example: 'Atributo eliminado permanentemente' })
  message: string = 'Atributo eliminado permanentemente'
}
