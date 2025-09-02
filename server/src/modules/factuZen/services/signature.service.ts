import { BillingApiService } from '@/modules/factuZen/services/api.service'
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common'

@Injectable()
export class BillingSignatureService {
  private readonly logger = new Logger(BillingSignatureService.name)

  constructor(private readonly billingApiService: BillingApiService) {}

  // Método para subir firma digital al perfil
  async uploadSignature(
    signatureFile: File | Buffer,
    signatureKey: string,
  ): Promise<any> {
    try {
      this.logger.log('🔐 Subiendo firma digital al perfil...')
      this.logger.log(
        `📤 Enviando archivo de firma con clave: ${signatureKey.substring(0, 4)}****`,
      )

      // Crear FormData para subir el archivo
      const formData = new FormData()

      // Si es un File object (desde el frontend)
      if (signatureFile instanceof File) {
        formData.append('signature_file', signatureFile)
      }
      // Si es un Buffer (desde Node.js)
      else if (Buffer.isBuffer(signatureFile)) {
        // En entorno Node.js, FormData se comporta diferente
        // Necesitamos convertir el Buffer a un formato compatible
        const blob = new Blob([signatureFile], { type: 'application/x-pkcs12' })
        formData.append('signature_file', blob, 'signature.p12')
      }
      // Si es una string (ruta del archivo)
      else if (typeof signatureFile === 'string') {
        throw new Error(
          'Para subir por ruta de archivo, debe convertirse a Buffer primero',
        )
      } else {
        throw new Error('Tipo de archivo de firma no soportado')
      }

      formData.append('signature_key', signatureKey)

      const response = await this.billingApiService.makeFormDataRequest<any>(
        'POST',
        '/profile/signature',
        formData,
        { timeout: 30000 },
      )

      this.logger.log('✅ Firma digital subida exitosamente')
      this.logger.log(
        '📋 Respuesta signature:',
        JSON.stringify(response, null, 2),
      )

      return response
    } catch (error) {
      this.logger.error('❌ Error al subir firma digital:', error.message)

      // Si es una HttpException, re-lanzarla
      if (error instanceof HttpException) {
        throw error
      }

      // Usar directamente el mensaje de la API externa si está disponible
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Error al subir firma digital'

      throw new HttpException(
        errorMessage,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  // Método auxiliar para validar archivo de firma antes de subirlo
  validateSignatureFile(file: File): { isValid: boolean; error?: string } {
    // Validar que el file no sea null o undefined
    if (!file) {
      return { isValid: false, error: 'No se ha proporcionado ningún archivo' }
    }

    // Validar extensión
    if (!file.name.toLowerCase().endsWith('.p12')) {
      return { isValid: false, error: 'El archivo debe tener extensión .p12' }
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { isValid: false, error: 'El archivo no debe superar los 5MB' }
    }

    // Validar tamaño mínimo (al menos 100 bytes)
    if (file.size < 100) {
      return {
        isValid: false,
        error: 'El archivo parece estar vacío o corrupto',
      }
    }

    // Validar tipo MIME si está disponible
    if (
      file.type &&
      ![
        'application/x-pkcs12',
        'application/pkcs12',
        'application/octet-stream',
      ].includes(file.type)
    ) {
      return {
        isValid: false,
        error: 'El archivo debe ser un certificado PKCS#12 (.p12)',
      }
    }

    return { isValid: true }
  }

  // Validar clave de firma
  validateSignatureKey(key: string): { isValid: boolean; error?: string } {
    if (!key) {
      return { isValid: false, error: 'La clave de la firma es obligatoria' }
    }

    if (key.length < 4) {
      return {
        isValid: false,
        error: 'La clave de la firma debe tener al menos 4 caracteres',
      }
    }

    if (key.length > 50) {
      return {
        isValid: false,
        error: 'La clave de la firma no puede tener más de 50 caracteres',
      }
    }

    return { isValid: true }
  }

  // Método para obtener información de la firma actual
  async getSignatureInfo(): Promise<any> {
    try {
      this.logger.log('📋 Obteniendo información de firma digital...')

      const response =
        await this.billingApiService.makeAuthenticatedRequest<any>(
          'GET',
          '/profile/signature',
        )

      this.logger.log('✅ Información de firma obtenida exitosamente')
      this.logger.log('📋 Info de firma:', JSON.stringify(response, null, 2))

      return response
    } catch (error) {
      if (error.response?.status === 404) {
        this.logger.log('ℹ️ No hay firma digital configurada')
        return null
      }

      this.logger.error(
        '❌ Error al obtener información de firma:',
        error.message,
      )

      throw new HttpException(
        `Error al obtener información de firma: ${error.response?.data?.message || error.message}`,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  // Método para eliminar la firma digital actual
  async deleteSignature(): Promise<any> {
    try {
      this.logger.log('🗑️ Eliminando firma digital...')

      const response =
        await this.billingApiService.makeAuthenticatedRequest<any>(
          'DELETE',
          '/profile/signature',
        )

      this.logger.log('✅ Firma digital eliminada exitosamente')
      return response
    } catch (error) {
      if (error.response?.status === 404) {
        throw new HttpException(
          'No hay firma digital configurada para eliminar',
          HttpStatus.NOT_FOUND,
        )
      }

      this.logger.error('❌ Error al eliminar firma digital:', error.message)

      throw new HttpException(
        `Error al eliminar firma digital: ${error.response?.data?.message || error.message}`,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  // Verificar estado de la firma digital
  async getSignatureStatus(): Promise<{
    hasSignature: boolean
    isValid: boolean
    expiresAt?: Date
    daysUntilExpiry?: number
    issuer?: string
    subject?: string
  }> {
    try {
      const signatureInfo = await this.getSignatureInfo()

      if (!signatureInfo) {
        return {
          hasSignature: false,
          isValid: false,
        }
      }

      const now = new Date()
      let expiresAt: Date | undefined
      let daysUntilExpiry: number | undefined
      let isValid = true

      if (signatureInfo.expires_at) {
        expiresAt = new Date(signatureInfo.expires_at)
        daysUntilExpiry = Math.ceil(
          (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        )
        isValid = expiresAt > now
      }

      return {
        hasSignature: true,
        isValid,
        expiresAt,
        daysUntilExpiry,
        issuer: signatureInfo.issuer,
        subject: signatureInfo.subject,
      }
    } catch (error) {
      this.logger.error('❌ Error al verificar estado de firma:', error.message)
      return {
        hasSignature: false,
        isValid: false,
      }
    }
  }

  // Método adicional para verificar si la firma está próxima a expirar
  async checkSignatureExpiry(warningDays = 30): Promise<{
    isExpiring: boolean
    daysUntilExpiry?: number
    message?: string
  }> {
    try {
      const status = await this.getSignatureStatus()

      if (!status.hasSignature) {
        return {
          isExpiring: false,
          message: 'No hay firma digital configurada',
        }
      }

      if (!status.isValid) {
        return {
          isExpiring: true,
          daysUntilExpiry: 0,
          message: 'La firma digital ha expirado',
        }
      }

      if (
        status.daysUntilExpiry !== undefined &&
        status.daysUntilExpiry <= warningDays
      ) {
        return {
          isExpiring: true,
          daysUntilExpiry: status.daysUntilExpiry,
          message: `La firma digital expira en ${status.daysUntilExpiry} días`,
        }
      }

      return {
        isExpiring: false,
        daysUntilExpiry: status.daysUntilExpiry,
        message: 'La firma digital es válida',
      }
    } catch (error) {
      this.logger.error(
        '❌ Error al verificar expiración de firma:',
        error.message,
      )
      return {
        isExpiring: false,
        message: 'Error al verificar el estado de la firma',
      }
    }
  }
}
