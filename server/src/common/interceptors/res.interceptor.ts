import {
  Catch,
  HttpStatus,
  HttpException,
  ArgumentsHost,
  ExceptionFilter,
  BadRequestException,
} from '@nestjs/common'
import { QueryFailedError } from 'typeorm'
import {
  ApiResponse,
  DeleteResponse,
} from '@/utils/types/request-response.type'

@Catch()
export class UnifiedResException implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()

    // Manejo especial para operaciones DELETE exitosas
    if (request.method === 'DELETE' && !(exception instanceof HttpException)) {
      const successResponse: DeleteResponse = {
        success: true,
        statusCode: 200,
        meta: {
          timestamp: new Date(),
          resource: request.route?.path || 'unknown',
          method: 'delete',
        },
      }
      return response.status(200).json(successResponse)
    }

    // Manejo específico de errores de validación (BadRequestException)
    if (exception instanceof BadRequestException) {
      const exceptionResponse = exception.getResponse()
      const errorResponse: ApiResponse = {
        success: false,
        statusCode: HttpStatus.BAD_REQUEST,
        error: {
          message: 'Datos inválidos',
          details: this.formatValidationErrors(exceptionResponse),
        },
        meta: {
          timestamp: new Date(),
          resource: request.route?.path || 'unknown',
          method: request.method,
        },
      }
      return response.status(HttpStatus.BAD_REQUEST).json(errorResponse)
    }

    // Manejo de errores de TypeORM
    if (exception instanceof QueryFailedError) {
      const status = 500
      const errorResponse: ApiResponse = {
        success: false,
        statusCode: status,
        error: {
          message: 'Database operation failed',
          details: {
            driverError: exception.driverError,
            query: exception.query,
            parameters: exception.parameters,
          },
        },
        meta: {
          timestamp: new Date(),
          resource: request.route?.path || 'unknown',
          method: request.method,
        },
      }
      return response.status(status).json(errorResponse)
    }

    // Manejo de otras excepciones HTTP
    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      const errorResponse: ApiResponse = {
        success: false,
        statusCode: status,
        error: {
          message: exception.message,
        },
        meta: {
          timestamp: new Date(),
          resource: request.route?.path || 'unknown',
          method: request.method,
        },
      }
      return response.status(status).json(errorResponse)
    }

    // Error inesperado/no manejado
    const errorResponse: ApiResponse = {
      success: false,
      statusCode: 500,
      error: {
        message: 'Internal server error',
      },
      meta: {
        timestamp: new Date(),
        resource: request.route?.path || 'unknown',
        method: request.method,
      },
    }
    return response.status(500).json(errorResponse)
  }

  private formatValidationErrors(errors: any): Record<string, string> {
    // Si es un objeto de respuesta estándar de NestJS
    if (typeof errors === 'object' && errors.message) {
      if (Array.isArray(errors.message))
        return this.formatValidationErrors(errors.message)
      return { general: errors.message }
    }

    // Si es un array de errores de class-validator
    if (Array.isArray(errors)) {
      const formattedErrors: Record<string, string> = {}

      errors.forEach((error) => {
        if (error.children && error.children.length > 0) {
          // Manejar errores anidados (como category.id)
          error.children.forEach((nestedError) => {
            if (nestedError.constraints) {
              formattedErrors[`${error.property}.${nestedError.property}`] =
                Object.values(nestedError.constraints).join(', ')
            }
          })
        } else if (error.constraints) {
          // Manejar errores simples
          formattedErrors[error.property] = Object.values(
            error.constraints,
          ).join(', ')
        }
      })

      return formattedErrors
    }

    // Si es un string (mensaje simple)
    if (typeof errors === 'string') {
      return { general: errors }
    }

    // Formato desconocido
    return { general: 'Unknown validation error' }
  }

  private getDeletionType(request: any): 'hard' | 'soft' {
    return request.path.includes('hard-delete') ? 'hard' : 'soft'
  }
}
