import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpException,
  HttpStatus,
  Logger,
  ParseUUIDPipe,
  UseGuards,
  Req,
  Res,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger'
import { BillingService } from '@/modules/factuZen/services/factuZen.service'
import {
  AuthResponseDto,
  CreateBillingDto,
  UpdateBillingDto,
} from '@/modules/factuZen/dto/auth.dto'
import { CreateFacturaDto } from '@/modules/factuZen/dto/factura.dto'
import { BillingDomain } from '@/modules/factuZen/domain/billing.domain'
import { PATH_SOURCE } from '@/common/constants/pathSource.const'
import { Roles } from '@/modules/roles/roles.decorator'
import { AuthGuard } from '@nestjs/passport'
import { RoleEnum, ROLES } from '@/common/constants/roles-const'
import { RolesGuard } from '@/modules/roles/roles.guard'
import { UpdateProfileDto } from '@/modules/factuZen/dto/profile.dto'
import { FastifyReply, FastifyRequest } from 'fastify'

@ApiTags(PATH_SOURCE.BILLING)
@ApiBearerAuth()
@Roles(RoleEnum.Admin, RoleEnum.Manager)
@SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER] })
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({
  path: PATH_SOURCE.BILLING,
  version: '1',
})
export class BillingController {
  private readonly logger = new Logger(BillingController.name)

  constructor(private readonly billingService: BillingService) {}

  // ===== GESTIÓN DE CONFIGURACIONES DE BILLING =====

  @Post('config')
  @ApiOperation({ summary: 'Crear nueva configuración de billing' })
  @ApiResponse({
    status: 201,
    description: 'Configuración creada exitosamente',
    type: BillingDomain,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  async createBillingConfig(
    @Body() createBillingDto: CreateBillingDto,
  ): Promise<{
    success: boolean
    message: string
    data: BillingDomain
  }> {
    try {
      this.logger.log('📝 Creando nueva configuración de billing...')
      const billingConfig =
        await this.billingService.createBillingConfig(createBillingDto)

      return {
        success: true,
        message: 'Configuración de billing creada exitosamente',
        data: billingConfig,
      }
    } catch (error) {
      this.logger.error('❌ Error al crear configuración:', error.message)
      throw new HttpException(
        error.message || 'Error al crear configuración de billing',
        error.status || HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Get('config')
  @ApiOperation({ summary: 'Obtener todas las configuraciones de billing' })
  @ApiResponse({
    status: 200,
    description: 'Lista de configuraciones obtenida exitosamente',
    type: [BillingDomain],
  })
  async getAllBillingConfigs(): Promise<{
    success: boolean
    message: string
    data: BillingDomain[]
  }> {
    try {
      this.logger.log('📋 Obteniendo todas las configuraciones de billing...')
      const configs = await this.billingService.getAllBillingConfigs()

      return {
        success: true,
        message: 'Configuraciones obtenidas exitosamente',
        data: configs,
      }
    } catch (error) {
      this.logger.error('❌ Error al obtener configuraciones:', error.message)
      throw new HttpException(
        'Error al obtener configuraciones de billing',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  @Put('config/:id')
  @ApiOperation({ summary: 'Actualizar configuración de billing' })
  @ApiParam({
    name: 'id',
    description: 'ID de la configuración a actualizar',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuración actualizada exitosamente',
    type: BillingDomain,
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración no encontrada',
  })
  async updateBillingConfig(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBillingDto: UpdateBillingDto,
  ): Promise<{
    success: boolean
    message: string
    data: BillingDomain
  }> {
    try {
      this.logger.log(`🔄 Actualizando configuración de billing: ${id}`)
      const updatedConfig = await this.billingService.updateBillingConfig(
        id,
        updateBillingDto,
      )

      return {
        success: true,
        message: 'Configuración actualizada exitosamente',
        data: updatedConfig,
      }
    } catch (error) {
      this.logger.error(
        `❌ Error al actualizar configuración ${id}:`,
        error.message,
      )
      throw new HttpException(
        error.message || 'Error al actualizar configuración de billing',
        error.status || HttpStatus.BAD_REQUEST,
      )
    }
  }

  @Delete('config/:id')
  @ApiOperation({ summary: 'Eliminar configuración de billing' })
  @ApiParam({
    name: 'id',
    description: 'ID de la configuración a eliminar',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuración eliminada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración no encontrada',
  })
  async deleteBillingConfig(@Param('id', ParseUUIDPipe) id: string): Promise<{
    success: boolean
    message: string
  }> {
    try {
      this.logger.log(`🗑️ Eliminando configuración de billing: ${id}`)
      const deleted = await this.billingService.deleteBillingConfig(id)

      if (!deleted) {
        throw new HttpException(
          'Configuración no encontrada',
          HttpStatus.NOT_FOUND,
        )
      }

      return {
        success: true,
        message: 'Configuración eliminada exitosamente',
      }
    } catch (error) {
      this.logger.error(
        `❌ Error al eliminar configuración ${id}:`,
        error.message,
      )
      throw new HttpException(
        error.message || 'Error al eliminar configuración de billing',
        error.status || HttpStatus.BAD_REQUEST,
      )
    }
  }

  // ===== AUTENTICACIÓN =====

  @Post('auth/login')
  @ApiOperation({ summary: 'Autenticar con la API de facturación' })
  @ApiResponse({
    status: 200,
    description: 'Autenticación exitosa',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
  })
  @ApiResponse({
    status: 412,
    description: 'No hay credenciales configuradas',
  })
  async authenticate(): Promise<{
    success: boolean
    message: string
    data: AuthResponseDto
  }> {
    try {
      this.logger.log('🔐 Iniciando proceso de autenticación...')
      const authResponse = await this.billingService.authenticate()

      return {
        success: true,
        message: 'Autenticación exitosa',
        data: authResponse,
      }
    } catch (error) {
      this.logger.error('❌ Error en autenticación:', error.message)
      throw new HttpException(
        error.message || 'Error de autenticación',
        error.status || HttpStatus.UNAUTHORIZED,
      )
    }
  }

  @Get('auth/status')
  @ApiOperation({ summary: 'Verificar estado de credenciales' })
  @ApiResponse({
    status: 200,
    description: 'Estado de credenciales obtenido',
  })
  async getCredentialsStatus(): Promise<{
    success: boolean
    message: string
    data: { hasCredentials: boolean; email?: string }
  }> {
    try {
      this.logger.log('🔍 Verificando estado de credenciales...')
      const status = this.billingService.getCredentialsStatus()

      return {
        success: true,
        message: 'Estado de credenciales obtenido',
        data: status,
      }
    } catch (error) {
      this.logger.error(
        '❌ Error al verificar estado de credenciales:',
        error.message,
      )
      throw new HttpException(
        'Error al verificar estado de credenciales',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  @Post('auth/reload-credentials')
  @ApiOperation({ summary: 'Forzar recarga de credenciales desde BD' })
  @ApiResponse({
    status: 200,
    description: 'Credenciales recargadas exitosamente',
  })
  async reloadCredentials(): Promise<{
    success: boolean
    message: string
  }> {
    try {
      this.logger.log('🔄 Forzando recarga de credenciales...')
      await this.billingService.reloadCredentials()

      return {
        success: true,
        message: 'Credenciales recargadas exitosamente',
      }
    } catch (error) {
      this.logger.error('❌ Error al recargar credenciales:', error.message)
      throw new HttpException(
        'Error al recargar credenciales',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  // ===== PERFIL DEL CLIENTE =====

  @Get('profile')
  @ApiOperation({ summary: 'Obtener perfil del cliente autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Perfil obtenido exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token inválido o expirado',
  })
  @ApiResponse({
    status: 404,
    description: 'Perfil no encontrado',
  })
  async getProfile(): Promise<{
    success: boolean
    message: string
    data: any
  }> {
    try {
      this.logger.log('👤 Obteniendo perfil del cliente...')
      const profile = await this.billingService.getProfile()

      return {
        success: true,
        message: 'Perfil obtenido exitosamente',
        data: profile,
      }
    } catch (error) {
      this.logger.error('❌ Error al obtener perfil:', error.message)
      throw new HttpException(
        error.message || 'Error al obtener perfil',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  @Get('profile/fiscal')
  @ApiOperation({ summary: 'Obtener información fiscal del perfil' })
  @ApiResponse({
    status: 200,
    description: 'Información fiscal obtenida exitosamente',
  })
  async getFiscalInfo(): Promise<{
    success: boolean
    message: string
    data: {
      ruc: string
      razonSocial: string
      nombreComercial: string
      dirMatriz: string
      contribuyenteEspecial: string
      obligadoContabilidad: boolean
      ambiente: string
      tarifa: string
    }
  }> {
    try {
      this.logger.log('🏢 Obteniendo información fiscal...')
      const fiscalInfo = await this.billingService.getFiscalInfo()

      return {
        success: true,
        message: 'Información fiscal obtenida exitosamente',
        data: fiscalInfo,
      }
    } catch (error) {
      this.logger.error(
        '❌ Error al obtener información fiscal:',
        error.message,
      )
      throw new HttpException(
        error.message || 'Error al obtener información fiscal',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  // ===== ENDPOINT DEL CONTROLLER =====
  @Put('profile')
  @ApiOperation({ summary: 'Actualizar perfil del cliente autenticado' })
  @ApiBody({
    type: UpdateProfileDto,
    description: 'Datos para actualizar el perfil del cliente',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil actualizado exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Perfil actualizado exitosamente' },
        data: {
          type: 'object',
          description: 'Datos del perfil actualizado',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos para actualizar perfil',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token inválido o expirado',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado para actualizar perfil',
  })
  @ApiResponse({
    status: 404,
    description: 'Perfil no encontrado',
  })
  @ApiResponse({
    status: 422,
    description: 'Datos de perfil no válidos',
  })
  async updateProfile(@Body() UpdateProfileDto: UpdateProfileDto): Promise<{
    success: boolean
    message: string
    data: any
  }> {
    try {
      this.logger.log('✏️ Actualizando perfil del cliente...')
      this.logger.log(
        '📝 Datos recibidos:',
        JSON.stringify(UpdateProfileDto, null, 2),
      )

      const updatedProfile =
        await this.billingService.updateProfile(UpdateProfileDto)

      return {
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: updatedProfile,
      }
    } catch (error) {
      this.logger.error('❌ Error al actualizar perfil:', error.message)
      throw new HttpException(
        error.message || 'Error al actualizar perfil',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  // ===== PUNTOS DE EMISIÓN =====

  @Get('puntos-emision')
  @ApiOperation({ summary: 'Obtener puntos de emisión disponibles' })
  @ApiResponse({
    status: 200,
    description: 'Puntos de emisión obtenidos exitosamente',
  })
  async getPuntosEmision(): Promise<{
    success: boolean
    message: string
    data: any[]
  }> {
    try {
      this.logger.log('📍 Obteniendo puntos de emisión...')
      const puntosEmision = await this.billingService.getPuntosEmision()

      return {
        success: true,
        message: `${puntosEmision.length} puntos de emisión obtenidos`,
        data: puntosEmision,
      }
    } catch (error) {
      this.logger.error('❌ Error al obtener puntos de emisión:', error.message)
      throw new HttpException(
        'Error al obtener puntos de emisión',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  // ===== FACTURACIÓN =====

  @Post('factura/:puntoEmision')
  @ApiOperation({ summary: 'Crear nueva factura' })
  @ApiParam({
    name: 'puntoEmision',
    description: 'Código del punto de emisión',
    example: '001001',
  })
  @ApiResponse({
    status: 201,
    description: 'Factura creada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Punto de emisión no encontrado',
  })
  @ApiResponse({
    status: 422,
    description: 'Datos de factura inválidos',
  })
  async createFactura(
    @Param('puntoEmision') puntoEmision: string,
    @Body() facturaData: CreateFacturaDto,
  ): Promise<{
    success: boolean
    message: string
    data: any
  }> {
    try {
      this.logger.log(`💳 Creando factura para punto: ${puntoEmision}`)
      const factura = await this.billingService.createFactura(
        puntoEmision,
        facturaData,
      )

      return {
        success: true,
        message: 'Factura creada exitosamente',
        data: factura,
      }
    } catch (error) {
      this.logger.error('❌ Error al crear factura:', error.message)
      throw new HttpException(
        error.message || 'Error al crear factura',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  @Post('factura-simple/:puntoEmision')
  @ApiOperation({ summary: 'Crear factura con datos simplificados' })
  @ApiParam({
    name: 'puntoEmision',
    description: 'Código del punto de emisión',
    example: '001001',
  })
  @ApiResponse({
    status: 201,
    description: 'Factura simple creada exitosamente',
  })
  async createSimpleFactura(
    @Param('puntoEmision') puntoEmision: string,
    @Body()
    simpleFacturaData: {
      cliente: {
        tipoIdentificacion: string
        razonSocial: string
        identificacion: string
        direccion: string
        email: string
        telefono: string
      }
      productos: {
        codigo: string
        descripcion: string
        cantidad: number
        precioUnitario: number
        ivaPorcentaje: number
      }[]
      formaPago?: string
    },
  ): Promise<{
    success: boolean
    message: string
    data: any
  }> {
    try {
      this.logger.log(`💳 Creando factura simple para punto: ${puntoEmision}`)

      const factura = await this.billingService.createSimpleFactura(
        puntoEmision,
        simpleFacturaData.cliente,
        simpleFacturaData.productos,
        simpleFacturaData.formaPago || '01', // Efectivo por defecto
      )

      return {
        success: true,
        message: 'Factura simple creada exitosamente',
        data: factura,
      }
    } catch (error) {
      this.logger.error('❌ Error al crear factura simple:', error.message)
      throw new HttpException(
        error.message || 'Error al crear factura simple',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }
  // ===== FIRMA DIGITAL (FASTIFY) =====

  @Post('signature/upload')
  @ApiOperation({ summary: 'Subir firma digital al perfil' })
  @ApiResponse({
    status: 200,
    description: 'Firma digital subida exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Archivo o clave de firma inválidos',
  })
  @ApiResponse({
    status: 413,
    description: 'Archivo demasiado grande',
  })
  @ApiResponse({
    status: 415,
    description: 'Formato de archivo no soportado',
  })
  async uploadSignature(
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    try {
      // Verificar si la solicitud es multipart
      if (!request.isMultipart()) {
        reply.code(400).send({
          success: false,
          message: 'La solicitud debe ser multipart/form-data',
        })
        return
      }

      const data = await request.file()
      if (!data) {
        reply.code(400).send({
          success: false,
          message: 'Archivo de firma requerido',
        })
        return
      }

      // Extraer signature_key de manera segura
      let signature_key = ''
      // Acceder directamente al campo signature_key
      const signatureField = data.fields?.signature_key
      if (signatureField) {
        if (Array.isArray(signatureField)) {
          // Si es un array, tomar el primer elemento
          const firstField = signatureField[0]
          if (firstField && 'value' in firstField) {
            signature_key = firstField.value as string
          }
        } else if ('value' in signatureField) {
          // Si es un objeto individual con propiedad value
          signature_key = signatureField.value as string
        }
      }

      this.logger.log('🔐 Validando archivo de firma...')

      // Validar archivo usando el método del servicio
      const fileValidation = this.billingService.validateSignatureFile({
        name: data.filename,
        size: data.file.bytesRead,
        type: data.mimetype,
      } as File)

      if (!fileValidation.isValid) {
        reply.code(400).send({
          success: false,
          message: 'Archivo no válido',
        })
        return
      }

      // Leer el contenido del archivo
      const buffer = await data.toBuffer()
      this.logger.log('🔐 Subiendo firma digital...')

      const result = await this.billingService.uploadSignature(
        buffer,
        signature_key,
      )

      // Verificar si la respuesta del servicio indica error
      if (!result.success) {
        reply.code(400).send({
          success: false,
          message: result.message || 'Error al procesar la firma digital',
          data: result.data || [],
          errors: result.errors || [],
        })
        return
      }

      reply.code(200).send({
        success: true,
        message: 'Firma digital subida exitosamente',
        data: result,
      })
    } catch (error) {
      this.logger.error('❌ Error al subir firma digital:', error.message)

      // Mapear errores conocidos de Fastify a códigos HTTP
      if (error.code === 'FST_ERR_REQ_FILE_TOO_LARGE') {
        reply.code(413).send({
          success: false,
          message: 'Archivo demasiado grande',
        })
      }
      // Si es una HttpException del servicio (errores de la API externa)
      else if (error.getStatus && error.getResponse) {
        const status = error.getStatus()
        const response = error.getResponse()
        reply.code(status).send({
          success: false,
          message:
            typeof response === 'string'
              ? response
              : response.message || error.message,
        })
      }
      // Fallback para otros tipos de error con statusCode
      else if (error.statusCode && error.message) {
        reply.code(error.statusCode).send({
          success: false,
          message: error.message,
        })
      } else {
        reply.code(500).send({
          success: false,
          message: 'Error interno al subir firma digital',
        })
      }
    }
  }

  @Get('signature/info')
  @ApiOperation({ summary: 'Obtener información de la firma digital actual' })
  @ApiResponse({
    status: 200,
    description: 'Información de firma obtenida exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'No hay firma digital configurada',
  })
  async getSignatureInfo(): Promise<{
    success: boolean
    message: string
    data: any
  }> {
    try {
      this.logger.log('📋 Obteniendo información de firma digital...')
      const signatureInfo = await this.billingService.getSignatureInfo()

      if (!signatureInfo) {
        return {
          success: false,
          message: 'No hay firma digital configurada',
          data: signatureInfo,
        }
      }

      return {
        success: true,
        message: 'Información de firma obtenida exitosamente',
        data: signatureInfo,
      }
    } catch (error) {
      this.logger.error(
        '❌ Error al obtener información de firma:',
        error.message,
      )
      throw new HttpException(
        error.message || 'Error al obtener información de firma',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  // ===== ENDPOINTS DE UTILIDAD =====

  @Get('health')
  @ApiOperation({ summary: 'Verificar estado del servicio de billing' })
  @ApiResponse({
    status: 200,
    description: 'Servicio funcionando correctamente',
  })
  async healthCheck(): Promise<{
    success: boolean
    message: string
    data: {
      service: string
      baseUrl: string
      hasCredentials: boolean
      timestamp: string
    }
  }> {
    try {
      this.logger.log('🏥 Verificando estado del servicio...')
      const credentialsStatus = this.billingService.getCredentialsStatus()

      return {
        success: true,
        message: 'Servicio de billing funcionando correctamente',
        data: {
          service: 'BillingService',
          baseUrl: this.billingService.getBaseUrl(),
          hasCredentials: credentialsStatus.hasCredentials,
          timestamp: new Date().toISOString(),
        },
      }
    } catch (error) {
      this.logger.error('❌ Error en health check:', error.message)
      throw new HttpException(
        'Error en el servicio de billing',
        HttpStatus.SERVICE_UNAVAILABLE,
      )
    }
  }

  @Get('test-connection')
  @ApiOperation({ summary: 'Probar conexión con la API de facturación' })
  @ApiResponse({
    status: 200,
    description: 'Conexión exitosa',
  })
  @ApiResponse({
    status: 401,
    description: 'Error de autenticación',
  })
  @ApiResponse({
    status: 503,
    description: 'API de facturación no disponible',
  })
  async testConnection(): Promise<{
    success: boolean
    message: string
    data: {
      authenticated: boolean
      puntosEmisionCount: number
      timestamp: string
    }
  }> {
    try {
      this.logger.log('🔌 Probando conexión con API de facturación...')

      // Intentar autenticar
      await this.billingService.authenticate()

      // Intentar obtener puntos de emisión para verificar conectividad completa
      const puntosEmision = await this.billingService.getPuntosEmision()

      return {
        success: true,
        message: 'Conexión con API de facturación exitosa',
        data: {
          authenticated: true,
          puntosEmisionCount: puntosEmision.length,
          timestamp: new Date().toISOString(),
        },
      }
    } catch (error) {
      this.logger.error('❌ Error al probar conexión:', error.message)
      throw new HttpException(
        `Error de conexión con API de facturación: ${error.message}`,
        error.status || HttpStatus.SERVICE_UNAVAILABLE,
      )
    }
  }

  @Get(':clave_acceso/pdf')
  @ApiOperation({ summary: 'Obtener PDF de comprobante por clave de acceso' })
  @ApiParam({
    name: 'clave_acceso',
    description: 'Clave de acceso del comprobante',
  })
  @ApiResponse({
    status: 200,
    description: 'PDF generado exitosamente',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token inválido o expirado',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado al comprobante',
  })
  @ApiResponse({
    status: 404,
    description: 'Comprobante no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Error de consulta en el SRI',
  })
  @UseInterceptors() // 🔑 Esto excluye todos los interceptors globales
  async getPdf(
    @Param('clave_acceso') clave_acceso: string,
    @Res({ passthrough: false }) res: FastifyReply,
  ) {
    try {
      const { pdfContent, fileName } =
        await this.billingService.getPdf(clave_acceso)

      return res
        .type('application/pdf')
        .header('Content-Disposition', `attachment; filename="${fileName}"`)
        .header('Content-Length', pdfContent.length.toString())
        .send(pdfContent)
    } catch (error) {
      return res.status(500).send({ error: error.message })
    }
  }

  @Get(':clave_acceso/xml')
  @UseInterceptors() // 🔑 Esto excluye todos los interceptors globales
  @ApiOperation({ summary: 'Obtener XML de comprobante por clave de acceso' })
  @ApiParam({
    name: 'clave_acceso',
    description: 'Clave de acceso del comprobante',
  })
  @ApiResponse({
    status: 200,
    description: 'XML generado exitosamente',
    content: {
      'application/xml': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token inválido o expirado',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado al comprobante',
  })
  @ApiResponse({
    status: 404,
    description: 'Comprobante no encontrado',
  })
  @ApiResponse({
    status: 409,
    description: 'Error de consulta en el SRI',
  })
  async getXml(
    @Param('clave_acceso') clave_acceso: string,
    @Res({ passthrough: false }) res: FastifyReply,
  ) {
    try {
      const { xmlContent, fileName } =
        await this.billingService.getXml(clave_acceso)

      return res
        .type('application/xml')
        .header('Content-Disposition', `attachment; filename="${fileName}"`)
        .header('Content-Length', xmlContent.length.toString())
        .send(xmlContent)
    } catch (error) {
      return res.status(500).send({ error: error.message })
    }
  }
}
