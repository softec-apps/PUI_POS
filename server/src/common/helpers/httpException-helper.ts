import {
  HttpException,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  UnprocessableEntityException,
  InternalServerErrorException,
} from '@nestjs/common'
import { HttpStatus } from '@nestjs/common/enums'

// Mensajes por defecto para códigos HTTP comunes
const DEFAULT_ERROR_MESSAGES: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'Solicitud inválida',
  [HttpStatus.UNAUTHORIZED]: 'No autorizado',
  [HttpStatus.NOT_FOUND]: 'Recurso no encontrado',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'Entidad no procesable',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'Error interno del servidor',
}

// Mapeo de excepciones HTTP
const HTTP_EXCEPTION_MAP = {
  [HttpStatus.BAD_REQUEST]: BadRequestException,
  [HttpStatus.UNAUTHORIZED]: UnauthorizedException,
  [HttpStatus.NOT_FOUND]: NotFoundException,
  [HttpStatus.UNPROCESSABLE_ENTITY]: UnprocessableEntityException,
  [HttpStatus.INTERNAL_SERVER_ERROR]: InternalServerErrorException,
}

export function throwHttpException(
  status: number,
  customMessage?: string,
): never {
  const ExceptionClass = HTTP_EXCEPTION_MAP[status] || HttpException
  const message =
    customMessage || DEFAULT_ERROR_MESSAGES[status] || 'Error desconocido'

  throw new ExceptionClass({
    status,
    errors: { name: message },
  })
}
