import {
  ProfileData,
  ProfileResponse,
} from '@/modules/factuZen/dto/profile.dto'
import { BillingApiService } from '@/modules/factuZen/services/api.service'
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common'

@Injectable()
export class BillingProfileService {
  private readonly logger = new Logger(BillingProfileService.name)

  constructor(private readonly billingApiService: BillingApiService) {}

  // Obtener el perfil del cliente autenticado
  async getProfile(): Promise<ProfileData> {
    try {
      this.logger.log('👤 Obteniendo perfil del cliente...')

      const response: ProfileResponse =
        await this.billingApiService.makeAuthenticatedRequest<ProfileResponse>(
          'GET',
          '/profile',
        )

      this.logger.log(
        '📋 Respuesta profile:',
        JSON.stringify(response, null, 2),
      )

      if (response.success && response.data) {
        this.logger.log('✅ Perfil obtenido exitosamente')
        return response.data
      } else {
        this.logger.warn('⚠️ Respuesta de perfil no exitosa')
        throw new Error('La API retornó success: false')
      }
    } catch (error) {
      this.logger.error('❌ Error al obtener perfil:', error.message)

      // Mejorar el mensaje de error según el status code
      let errorMessage = 'Error al obtener perfil'
      switch (error.response?.status) {
        case 401:
          errorMessage = 'No autorizado - Token inválido o expirado'
          break
        case 403:
          errorMessage = 'Acceso denegado al perfil'
          break
        case 404:
          errorMessage = 'Perfil no encontrado'
          break
        case 500:
          errorMessage = 'Error interno en la API de facturación'
          break
        default:
          errorMessage = `Error al obtener perfil: ${error.response?.data?.message || error.message}`
      }

      throw new HttpException(
        errorMessage,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  // Obtener solo la información fiscal del perfil
  async getFiscalInfo(): Promise<{
    ruc: string
    razonSocial: string
    nombreComercial: string
    dirMatriz: string
    contribuyenteEspecial: string
    obligadoContabilidad: boolean
    ambiente: string
    tarifa: string
  }> {
    try {
      this.logger.log('🏢 Obteniendo información fiscal...')
      const profile = await this.getProfile()

      const fiscalInfo = {
        ruc: profile.ruc,
        razonSocial: profile.razonSocial || '',
        nombreComercial: profile.nombreComercial || '',
        dirMatriz: profile.dirMatriz || '',
        contribuyenteEspecial: profile.contribuyenteEspecial || '',
        obligadoContabilidad: profile.obligadoContabilidad || false,
        ambiente: profile.ambiente?.toString() || '',
        tarifa: profile.tarifa || '',
      }

      this.logger.log('📋 Información fiscal obtenida:', fiscalInfo)
      return fiscalInfo
    } catch (error) {
      this.logger.error(
        '❌ Error al obtener información fiscal:',
        error.message,
      )
      throw new HttpException(
        'Error al obtener información fiscal',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  // Actualizar el perfil del cliente autenticado
  async updateProfile(updateData: {
    name?: string
    razonSocial?: string
    nombreComercial?: string
    dirMatriz?: string
    contribuyenteEspecial?: string
    obligadoContabilidad?: boolean
    ambiente?: number
    tarifa?: string
  }): Promise<ProfileData> {
    try {
      this.logger.log('✏️ Actualizando perfil del cliente...')
      this.logger.log(
        '📝 Datos a actualizar:',
        JSON.stringify(updateData, null, 2),
      )

      const response: ProfileResponse =
        await this.billingApiService.makeAuthenticatedRequest<ProfileResponse>(
          'PUT',
          '/profile',
          updateData,
        )

      this.logger.log(
        '📋 Respuesta actualización profile:',
        JSON.stringify(response, null, 2),
      )

      if (response.success && response.data) {
        this.logger.log('✅ Perfil actualizado exitosamente')
        return response.data
      } else {
        this.logger.warn('⚠️ Respuesta de actualización no exitosa')
        throw new Error('La API retornó success: false')
      }
    } catch (error) {
      this.logger.error('❌ Error al actualizar perfil:', error.message)

      // Mejorar el mensaje de error según el status code
      let errorMessage = 'Error al actualizar perfil'
      switch (error.response?.status) {
        case 400:
          errorMessage = 'Datos inválidos para actualizar perfil'
          break
        case 401:
          errorMessage = 'No autorizado - Token inválido o expirado'
          break
        case 403:
          errorMessage = 'Acceso denegado para actualizar perfil'
          break
        case 404:
          errorMessage = 'Perfil no encontrado'
          break
        case 422:
          errorMessage = 'Datos de perfil no válidos'
          break
        case 500:
          errorMessage = 'Error interno en la API de facturación'
          break
        default:
          errorMessage = `Error al actualizar perfil: ${error.response?.data?.message || error.message}`
      }

      throw new HttpException(
        errorMessage,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  // Validar datos de perfil antes de actualizar
  validateProfileData(profileData: {
    name?: string
    razonSocial?: string
    nombreComercial?: string
    dirMatriz?: string
    contribuyenteEspecial?: string
    obligadoContabilidad?: boolean
    ambiente?: number
    tarifa?: string
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Validar RUC si se proporciona razón social
    if (profileData.razonSocial && profileData.razonSocial.length < 3) {
      errors.push('La razón social debe tener al menos 3 caracteres')
    }

    // Validar nombre comercial
    if (profileData.nombreComercial && profileData.nombreComercial.length < 2) {
      errors.push('El nombre comercial debe tener al menos 2 caracteres')
    }

    // Validar dirección
    if (profileData.dirMatriz && profileData.dirMatriz.length < 5) {
      errors.push('La dirección matriz debe tener al menos 5 caracteres')
    }

    // Validar contribuyente especial
    if (
      profileData.contribuyenteEspecial &&
      !/^\d+$/.test(profileData.contribuyenteEspecial)
    ) {
      errors.push(
        'El número de contribuyente especial debe contener solo dígitos',
      )
    }

    // Validar ambiente
    if (
      profileData.ambiente !== undefined &&
      ![1, 2].includes(profileData.ambiente)
    ) {
      errors.push('El ambiente debe ser 1 (Pruebas) o 2 (Producción)')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  // Obtener configuración de ambientes disponibles
  getAmbientesConfig(): {
    value: number
    label: string
    description: string
  }[] {
    return [
      {
        value: 1,
        label: 'Pruebas',
        description: 'Ambiente de desarrollo y pruebas',
      },
      {
        value: 2,
        label: 'Producción',
        description: 'Ambiente productivo real',
      },
    ]
  }

  // Obtener tipos de identificación válidos
  getTiposIdentificacion(): { code: string; name: string }[] {
    return [
      { code: '04', name: 'RUC' },
      { code: '05', name: 'Cédula' },
      { code: '06', name: 'Pasaporte' },
      { code: '07', name: 'Consumidor Final' },
      { code: '08', name: 'Identificación del Exterior' },
    ]
  }

  // Verificar si el perfil está completamente configurado
  async isProfileComplete(): Promise<{
    complete: boolean
    missingFields: string[]
  }> {
    try {
      const profile = await this.getProfile()
      const missingFields: string[] = []

      // Campos obligatorios para facturación
      if (!profile.ruc) missingFields.push('RUC')
      if (!profile.razonSocial) missingFields.push('Razón Social')
      if (!profile.dirMatriz) missingFields.push('Dirección Matriz')
      if (
        profile.obligadoContabilidad === null ||
        profile.obligadoContabilidad === undefined
      ) {
        missingFields.push('Obligado a llevar contabilidad')
      }
      if (!profile.ambiente) missingFields.push('Ambiente')

      return {
        complete: missingFields.length === 0,
        missingFields,
      }
    } catch (error) {
      this.logger.error(
        '❌ Error al verificar completitud del perfil:',
        error.message,
      )
      throw new HttpException(
        'Error al verificar el perfil',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  // Obtener resumen del perfil para mostrar en dashboard
  async getProfileSummary(): Promise<{
    ruc: string
    razonSocial: string
    ambiente: string
    hasSignature: boolean
    isComplete: boolean
  }> {
    try {
      const profile = await this.getProfile()
      const completeness = await this.isProfileComplete()

      return {
        ruc: profile.ruc || 'No configurado',
        razonSocial: profile.razonSocial || 'No configurado',
        ambiente:
          profile.ambiente === 1
            ? 'Pruebas'
            : profile.ambiente === 2
              ? 'Producción'
              : 'No configurado',
        hasSignature: !!profile?.signature_expires_at,
        isComplete: completeness.complete,
      }
    } catch (error) {
      this.logger.error(
        '❌ Error al obtener resumen del perfil:',
        error.message,
      )
      throw new HttpException(
        'Error al obtener resumen del perfil',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  // Obtener configuración de tarifa 0% para productos
  getTarifaConfig(): { code: string; name: string; percentage: number }[] {
    return [
      { code: '0', name: 'IVA 0%', percentage: 0 },
      { code: '2', name: 'IVA 12%', percentage: 12 },
      { code: '3', name: 'IVA 14%', percentage: 14 },
      { code: '4', name: 'IVA 15%', percentage: 15 },
      { code: '5', name: 'IVA 5%', percentage: 5 },
      { code: '6', name: 'No Objeto de Impuesto', percentage: 0 },
      { code: '7', name: 'Exento de IVA', percentage: 0 },
      { code: '8', name: 'IVA 8%', percentage: 8 },
    ]
  }
}
