import { ApiProperty } from '@nestjs/swagger'
import { PATH_SOURCE } from '@/common/constants/pathSource.const'
import { MESSAGE_RESPONSE } from '@/modules/brand/messages/responseOperation.message'

export class MetaDto {
  @ApiProperty({ example: '2025-06-23T19:41:01.120Z' })
  timestamp: string

  @ApiProperty({ example: PATH_SOURCE.BRAND })
  resource: string

  @ApiProperty({ example: 'create' })
  method: string
}

export class ResponseBrandDto<T = any> {
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

export class CreateBrandResponseDto<T = any> extends ResponseBrandDto<T> {
  @ApiProperty({ example: true })
  success: boolean = true

  @ApiProperty({ example: 201 })
  statusCode: number = 201

  @ApiProperty({ example: MESSAGE_RESPONSE.CREATED })
  message: string = MESSAGE_RESPONSE.CREATED
}

export class UpdateBrandResponseDto<T = any> extends ResponseBrandDto<T> {
  @ApiProperty({ example: true })
  success: boolean = true

  @ApiProperty({ example: 200 })
  statusCode: number = 200

  @ApiProperty({ example: MESSAGE_RESPONSE.UPDATED })
  message: string = MESSAGE_RESPONSE.UPDATED
}

export class FindOneBrandResponseDto<T = any> extends ResponseBrandDto<T> {
  @ApiProperty({ example: true })
  success: boolean = true

  @ApiProperty({ example: 200 })
  statusCode: number = 200

  @ApiProperty({ example: MESSAGE_RESPONSE.READED })
  message: string = MESSAGE_RESPONSE.READED
}

export class FindAllBrandResponseDto<T = any> extends ResponseBrandDto<T[]> {
  @ApiProperty({ example: true })
  success: boolean = true

  @ApiProperty({ example: 200 })
  statusCode: number = 200

  @ApiProperty({ example: MESSAGE_RESPONSE.LISTED })
  message: string = MESSAGE_RESPONSE.LISTED

  @ApiProperty({ type: [Object] })
  data?: T[]
}

export class SoftDeleteBrandResponseDto<T = any> extends ResponseBrandDto<T> {
  @ApiProperty({ example: true })
  success: boolean = true

  @ApiProperty({ example: 200 })
  statusCode: number = 200

  @ApiProperty({ example: MESSAGE_RESPONSE.DELETED.SOFT })
  message: string = MESSAGE_RESPONSE.DELETED.SOFT
}

export class HardDeleteBrandResponseDto<T = any> extends ResponseBrandDto<T> {
  @ApiProperty({ example: true })
  success: boolean = true

  @ApiProperty({ example: 200 })
  statusCode: number = 200

  @ApiProperty({ example: MESSAGE_RESPONSE.DELETED.HARD })
  message: string = MESSAGE_RESPONSE.DELETED.HARD
}
