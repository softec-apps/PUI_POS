import { ApiProperty } from '@nestjs/swagger'

export class ValidationErrorDetails {
  [key: string]: string
}

export class BaseMetaDto {
  @ApiProperty({
    example: '2025-06-23T12:00:00.000Z',
    description: 'Timestamp de la operación',
  })
  timestamp: string

  @ApiProperty({
    example: '/api/v1/resource',
    description: 'Recurso de la API',
  })
  resource: string

  @ApiProperty({
    example: 'POST',
    description: 'Operación HTTP realizada',
  })
  method: string
}

export class BaseErrorDto {
  @ApiProperty({
    example: 'Mensaje de error',
    description: 'Mensaje principal del error',
  })
  message: string

  @ApiProperty({
    description: 'Detalles específicos del error',
    type: 'object',
    additionalProperties: { type: 'string' },
    example: {
      field1: 'Error en campo 1',
      field2: 'Error en campo 2',
    },
  })
  details?: ValidationErrorDetails
}

export abstract class BaseResponseDto {
  @ApiProperty({
    description: 'Indica si la operación fue exitosa',
  })
  success: boolean

  @ApiProperty({
    description: 'Código de estado HTTP',
  })
  statusCode: number
}

export abstract class BaseErrorResponseDto extends BaseResponseDto {
  @ApiProperty({
    description: 'Indica si la operación fue exitosa',
    example: false,
  })
  success: boolean = false

  @ApiProperty({
    description: 'Información del error',
    type: BaseErrorDto,
  })
  error: BaseErrorDto

  @ApiProperty({
    description: 'Metadatos de la respuesta',
    type: BaseMetaDto,
  })
  meta: BaseMetaDto
}

export abstract class BaseSuccessResponseDto extends BaseResponseDto {
  @ApiProperty({
    description: 'Indica si la operación fue exitosa',
    example: true, // Sobrescribir con true para éxito
  })
  success: boolean = true

  @ApiProperty({
    description: 'Mensaje de éxito',
  })
  message: string

  @ApiProperty({
    description: 'Datos de respuesta',
    required: false,
  })
  data?: any

  @ApiProperty({
    description: 'Metadatos de la respuesta',
    type: BaseMetaDto,
  })
  meta: BaseMetaDto
}
