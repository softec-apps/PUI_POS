import { ApiProperty } from '@nestjs/swagger'

export class MetaDto {
  @ApiProperty({ example: '2025-06-23T19:41:01.120Z' })
  timestamp: string

  @ApiProperty({ example: 'templates' })
  resource: string

  @ApiProperty({ example: 'create' })
  method: string
}

// DTO base genérico
export class ResponseTemplateDto<T = any> {
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
export class CreateTemplateResponseDto<T = any> extends ResponseTemplateDto<T> {
  @ApiProperty({ example: true })
  success: boolean = true

  @ApiProperty({ example: 201 })
  statusCode: number = 201

  @ApiProperty({ example: 'Plantilla creada exitosamente' })
  message: string = 'Plantilla creada exitosamente'
}

export class UpdateTemplateResponseDto<T = any> extends ResponseTemplateDto<T> {
  @ApiProperty({ example: true })
  success: boolean = true

  @ApiProperty({ example: 200 })
  statusCode: number = 200

  @ApiProperty({ example: 'Plantilla actualizada exitosamente' })
  message: string = 'Plantilla actualizada exitosamente'
}

export class FindOneTemplateResponseDto<
  T = any,
> extends ResponseTemplateDto<T> {
  @ApiProperty({ example: true })
  success: boolean = true

  @ApiProperty({ example: 200 })
  statusCode: number = 200

  @ApiProperty({ example: 'Plantilla obtenida exitosamente' })
  message: string = 'Plantilla obtenida exitosamente'
}

export class FindAllTemplateResponseDto<T = any> extends ResponseTemplateDto<
  T[]
> {
  @ApiProperty({ example: true })
  success: boolean = true

  @ApiProperty({ example: 200 })
  statusCode: number = 200

  @ApiProperty({ example: 'Plantillas listadas exitosamente' })
  message: string = 'Plantillas listadas exitosamente'

  @ApiProperty({ type: [Object] })
  data?: T[]
}

export class DeleteTemplateResponseDto<T = any> extends ResponseTemplateDto<T> {
  @ApiProperty({ example: true })
  success: boolean = true

  @ApiProperty({ example: 200 })
  statusCode: number = 200

  @ApiProperty({ example: 'Plantilla eliminada exitosamente' })
  message: string = 'Plantilla eliminada exitosamente'
}

export class HardDeleteTemplateResponseDto<
  T = any,
> extends ResponseTemplateDto<T> {
  @ApiProperty({ example: true })
  success: boolean = true

  @ApiProperty({ example: 200 })
  statusCode: number = 200

  @ApiProperty({ example: 'Plantilla eliminada permanentemente' })
  message: string = 'Plantilla eliminada permanentemente'
}
