import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { Request } from 'express'
import * as winston from 'winston'
import { v4 as uuidv4 } from 'uuid'
import { tap } from 'rxjs/operators'
import { ApiResponse } from '@/utils/types/request-response.type'

// Helper functions
const getStatusEmoji = (statusCode: number): string => {
  if (statusCode >= 500) return '🔥' // Server errors
  if (statusCode >= 400) return '❌' // Client errors
  if (statusCode >= 300) return '⚠️' // Redirects
  return '✅' // Success
}

const getTimeEmoji = (responseTime: number): string => {
  if (responseTime > 2000) return '🐢'
  if (responseTime > 1000) return '🐌'
  if (responseTime > 500) return '⏳'
  return '⚡'
}

const createLogEntry = (info: any) => {
  const separator = '='.repeat(105)
  const lines: string[] = []

  lines.push(separator)
  lines.push(
    `🆔 ${info.requestId} | 🕐 ${info.timestamp} | ${info.level.toUpperCase()} | ${info.message}`,
  )
  lines.push('-'.repeat(105))
  lines.push(`📍 ${info.method} ${info.originalUrl}`)

  if (info.ip) lines.push(`🌐 IP: ${info.ip}`)

  // Solo mostrar status si está definido
  if (info.statusCode !== undefined) {
    lines.push(
      `${getStatusEmoji(info.statusCode)} Status: ${info.statusCode} - ${
        HttpStatus[info.statusCode] || 'Unknown Status'
      }`,
    )
  }

  // Solo mostrar tiempo de respuesta si está definido
  if (info.responseTime !== undefined) {
    lines.push(
      `${getTimeEmoji(info.responseTime)} Response Time: ${info.responseTime}ms`,
    )
  }

  // Mostrar error si existe
  if (info.error) lines.push(`💥 Error: ${info.error}`)

  // Mostrar detalles adicionales si existen
  if (info.details) {
    lines.push(`📝 Details:`)
    lines.push(JSON.stringify(info.details, null, 2))
  }

  // Mostrar request body si existe
  if (info.requestBody) {
    lines.push(`📦 Request Body:`)
    lines.push(JSON.stringify(info.requestBody, null, 2))
  }

  // Mostrar response body si existe
  if (info.responseBody) {
    lines.push(`📬 Response Body:`)
    lines.push(JSON.stringify(info.responseBody, null, 2))
  }

  lines.push(separator)
  return lines.join('\n')
}

// Logger configurado SOLO para archivo (sin consola)
const fileLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(createLogEntry),
  ),
  transports: [
    // SOLO transporte de archivo - removido el transporte de consola
    new winston.transports.File({
      filename: 'logs/requests.log',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true,
    }),
  ],
  // Opción adicional para evitar logs por defecto en consola
  silent: false, // Mantén en false para que funcione el archivo
  exitOnError: false,
})

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly isDevelopment = process.env.NODE_ENV === 'development'

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp()
    const request = ctx.getRequest<Request>()
    const response = ctx.getResponse()
    const { method, originalUrl, ip, body } = request

    // Generar UUID único para la petición
    const requestId = uuidv4()
    if ('locals' in response) {
      response.locals.requestId = requestId
    }

    const startTime = Date.now()

    return next.handle().pipe(
      tap({
        next: (responseData: ApiResponse) => {
          const responseTime = Date.now() - startTime
          const statusCode =
            responseData?.statusCode || response.statusCode || HttpStatus.OK

          const logData = {
            requestId,
            message: 'Request Completed Successfully',
            method,
            originalUrl,
            statusCode,
            responseTime,
            ip,
            requestBody: this.isDevelopment
              ? this.sanitizeBody(body)
              : undefined,
            responseBody: this.prepareResponseBody(responseData),
          }

          if (statusCode >= 400) {
            fileLogger.warn(logData)
          } else {
            fileLogger.info(logData)
          }
        },
        error: (err) => {
          const responseTime = Date.now() - startTime
          const statusCode = this.getStatusCode(err, response)
          const errorResponse = err.response || {}
          const details = errorResponse.details || null
          const errorMessage = errorResponse.message || err.message

          const logData = {
            requestId,
            message: 'Request Failed',
            method,
            originalUrl,
            statusCode,
            responseTime,
            error: errorMessage,
            details,
            ip,
            requestBody: this.isDevelopment
              ? this.sanitizeBody(body)
              : undefined,
          }

          fileLogger.error(logData)
        },
      }),
    )
  }

  private prepareResponseBody(responseData: any): any {
    if (!responseData) return undefined

    // Si es una respuesta estructurada
    if (typeof responseData === 'object' && 'success' in responseData) {
      return {
        success: responseData.success,
        statusCode: responseData.statusCode,
        message: responseData.message,
        data: responseData.data,
        meta: responseData.meta,
      }
    }

    return responseData
  }

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') return body

    const sensitiveFields = [
      'password',
      'token',
      'authorization',
      'secret',
      'key',
    ]
    const sanitized = { ...body }

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***'
      }
    }

    return sanitized
  }

  private getStatusCode(err: any, response: any): number {
    if (err.status === HttpStatus.UNPROCESSABLE_ENTITY)
      return HttpStatus.UNPROCESSABLE_ENTITY

    if (err.response?.statusCode) return err.response.statusCode

    if (err.status) return err.status

    if (response.statusCode) return response.statusCode

    return HttpStatus.INTERNAL_SERVER_ERROR
  }
}
