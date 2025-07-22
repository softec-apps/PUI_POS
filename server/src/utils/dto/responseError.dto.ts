import {
  BaseErrorDto,
  BaseErrorResponseDto,
} from '@/utils/dto/responseBase.dto'
import { ApiProperty } from '@nestjs/swagger'

// 400 Bad Request
export class BadRequestResponseDto extends BaseErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean = false

  @ApiProperty({ example: 400 })
  statusCode: number = 400

  @ApiProperty({
    example: {
      message: 'Datos inválidos',
      details: {
        field: 'Campo requerido',
      },
    },
    type: BaseErrorDto,
  })
  error: BaseErrorDto
}

// 401 Unauthorized
export class UnauthorizedResponseDto extends BaseErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean = false

  @ApiProperty({ example: 401 })
  statusCode: number = 401

  @ApiProperty({
    example: {
      message: 'No autorizado',
    },
    type: BaseErrorDto,
  })
  error: BaseErrorDto
}

// 403 Forbidden
export class ForbiddenResponseDto extends BaseErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean = false

  @ApiProperty({ example: 403 })
  statusCode: number = 403

  @ApiProperty({
    example: {
      message: 'Acceso prohibido',
    },
    type: BaseErrorDto,
  })
  error: BaseErrorDto
}

// 404 Not Found
export class NotFoundResponseDto extends BaseErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean = false

  @ApiProperty({ example: 404 })
  statusCode: number = 404

  @ApiProperty({
    example: {
      message: 'Recurso no encontrado',
    },
    type: BaseErrorDto,
  })
  error: BaseErrorDto
}

// 409 Conflict
export class ConflictResponseDto extends BaseErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean = false

  @ApiProperty({ example: 409 })
  statusCode: number = 409

  @ApiProperty({
    example: {
      message: 'Campos en conflicto',
    },
    type: BaseErrorDto,
  })
  error: BaseErrorDto
}

// 422 Unprocessable Entity
export class UnprocessableEntityResponseDto extends BaseErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean = false

  @ApiProperty({ example: 422 })
  statusCode: number = 422

  @ApiProperty({
    example: {
      message: 'Entidad no procesable',
      details: {
        field: 'Valor no válido',
      },
    },
    type: BaseErrorDto,
  })
  error: BaseErrorDto
}

// 500 Internal Server Error
export class InternalServerErrorResponseDto extends BaseErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean = false

  @ApiProperty({ example: 500 })
  statusCode: number = 500

  @ApiProperty({
    example: {
      message: 'Error interno del servidor',
    },
    type: BaseErrorDto,
  })
  error: BaseErrorDto
}
