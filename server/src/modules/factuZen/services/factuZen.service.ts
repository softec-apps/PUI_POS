import {
  Injectable,
  HttpException,
  HttpStatus,
  Logger,
  OnModuleInit,
} from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { BillingRepository } from '@/modules/factuZen/repositories/billing.repository'
import { BillingDomain } from '@/modules/factuZen/domain/billing.domain'
import {
  CreateBillingDto,
  UpdateBillingDto,
  AuthResponseDto,
} from '@/modules/factuZen/dto/auth.dto'
import { CreateFacturaDto } from '@/modules/factuZen/dto/factura.dto'
import { ProfileData } from '@/modules/factuZen/dto/profile.dto'

// Importar servicios especializados
import { BillingAuthService } from '@/modules/factuZen/services/auth.service'
import { BillingConfigService } from '@/modules/factuZen/services/config.service'
import { BillingApiService } from '@/modules/factuZen/services/api.service'
import { BillingInvoiceService } from '@/modules/factuZen/services/billing.service'
import { BillingProfileService } from '@/modules/factuZen/services/profile.service'
import { BillingSignatureService } from '@/modules/factuZen/services/signature.service'
import { BillingFileInvoiceService } from '@/modules/factuZen/services/fileInvoice.service'

@Injectable()
export class BillingService implements OnModuleInit {
  private readonly logger = new Logger(BillingService.name)
  private readonly baseUrl: string = process.env.BILLING_API_BASE_URL as string

  // Servicios especializados
  private _authService?: BillingAuthService
  private _configService?: BillingConfigService
  private _apiService?: BillingApiService
  private _invoiceService?: BillingInvoiceService
  private _profileService?: BillingProfileService
  private _signatureService?: BillingSignatureService
  private _fileInvoiceService?: BillingFileInvoiceService

  constructor(
    private readonly httpService: HttpService,
    private readonly billingRepository: BillingRepository,
  ) {}

  async onModuleInit() {
    this.logger.log(`BillingService initialized with baseUrl: ${this.baseUrl}`)
    await this.initializeServices()
    await this.configService.loadCredentials()
  }

  private async initializeServices() {
    // Inicializar servicios en el orden correcto de dependencias
    this._authService = new BillingAuthService(this.httpService, this.baseUrl)
    this._configService = new BillingConfigService(
      this.billingRepository,
      this.authService,
    )
    this._apiService = new BillingApiService(
      this.httpService,
      this.authService,
      this.configService,
      this.baseUrl,
    )
    this._invoiceService = new BillingInvoiceService(this.apiService)
    this._profileService = new BillingProfileService(this.apiService)
    this._signatureService = new BillingSignatureService(this.apiService)
    this._fileInvoiceService = new BillingFileInvoiceService( // ← Agregar esta línea
      this.apiService,
      this.httpService, // ← Pasar httpService como segundo parámetro
    )

    this.logger.log(
      '✅ Todos los servicios de billing inicializados correctamente',
    )
  }

  // ===== GETTERS PARA ACCEDER A LOS SERVICIOS =====
  get authService(): BillingAuthService {
    if (!this._authService) throw new Error('AuthService not initialized')
    return this._authService
  }

  get configService(): BillingConfigService {
    if (!this._configService) throw new Error('ConfigService not initialized')
    return this._configService
  }

  get apiService(): BillingApiService {
    if (!this._apiService) throw new Error('ApiService not initialized')
    return this._apiService
  }

  get invoiceService(): BillingInvoiceService {
    if (!this._invoiceService) throw new Error('InvoiceService not initialized')
    return this._invoiceService
  }

  get profileService(): BillingProfileService {
    if (!this._profileService) throw new Error('ProfileService not initialized')
    return this._profileService
  }

  get signatureService(): BillingSignatureService {
    if (!this._signatureService)
      throw new Error('SignatureService not initialized')
    return this._signatureService
  }

  get fileInvoiceService(): BillingFileInvoiceService {
    if (!this._fileInvoiceService)
      throw new Error('FileInvoice service not initialized')
    return this._fileInvoiceService
  }

  // ===== MÉTODOS DE COMPATIBILIDAD =====
  // Estos métodos mantienen la misma interfaz que el servicio original
  // pero delegan la funcionalidad a los servicios especializados

  // Getter for baseUrl (para mantener compatibilidad)
  public getBaseUrl(): string {
    return this.baseUrl
  }

  // ===== GESTIÓN DE CREDENCIALES =====
  async createBillingConfig(
    createBillingDto: CreateBillingDto,
  ): Promise<BillingDomain> {
    return this.configService.createBillingConfig(createBillingDto)
  }

  async updateBillingConfig(
    id: string,
    updateBillingDto: UpdateBillingDto,
  ): Promise<BillingDomain> {
    return this.configService.updateBillingConfig(id, updateBillingDto)
  }

  async getAllBillingConfigs(): Promise<BillingDomain[]> {
    return this.configService.getAllBillingConfigs()
  }

  async deleteBillingConfig(id: string): Promise<boolean> {
    return this.configService.deleteBillingConfig(id)
  }

  async reloadCredentials(): Promise<void> {
    return this.configService.reloadCredentials()
  }

  getCredentialsStatus(): { hasCredentials: boolean; email?: string } {
    return this.configService.getCredentialsStatus()
  }

  // ===== AUTENTICACIÓN =====
  async authenticate(): Promise<AuthResponseDto> {
    const credentials = await this.configService.ensureCredentials()
    return this.authService.authenticate(credentials)
  }

  async getValidToken(): Promise<string> {
    return this.apiService.getValidToken()
  }

  // ===== PUNTOS DE EMISIÓN Y FACTURACIÓN =====
  async getPuntosEmision(): Promise<any[]> {
    return this.invoiceService.getPuntosEmision()
  }

  async createFactura(
    puntoEmision: string,
    facturaData: CreateFacturaDto,
  ): Promise<any> {
    return this.invoiceService.createFactura(puntoEmision, facturaData)
  }

  async createFacturaSRI(
    puntoEmision: string,
    clienteData: {
      tipoIdentificacion: string
      razonSocial: string
      identificacion: string
      direccion: string
      email: string
      telefono: string
    },
    productos: {
      codigo: string
      descripcion: string
      cantidad: number
      precioUnitario: number
      ivaPorcentaje: number
      descuento?: number
    }[],
    formaPago: string = '01',
  ): Promise<any> {
    return this.invoiceService.createFacturaSRI(
      puntoEmision,
      clienteData,
      productos,
      formaPago,
    )
  }

  // ===== FIRMA DIGITAL =====
  async uploadSignature(
    signatureFile: File | Buffer,
    signatureKey: string,
  ): Promise<any> {
    return this.signatureService.uploadSignature(signatureFile, signatureKey)
  }

  validateSignatureFile(file: File): { isValid: boolean; error?: string } {
    return this.signatureService.validateSignatureFile(file)
  }

  async getSignatureInfo(): Promise<any> {
    return this.signatureService.getSignatureInfo()
  }

  // ===== PERFIL =====
  async getProfile(): Promise<ProfileData> {
    return this.profileService.getProfile()
  }

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
    return this.profileService.getFiscalInfo()
  }

  async updateProfile(updateData: {
    name?: string
    razonSocial?: string
    nombreComercial?: string
    dirMatriz?: string
    contribuyenteEspecial?: string
    obligadoContabilidad?: boolean
  }): Promise<ProfileData> {
    return this.profileService.updateProfile(updateData)
  }

  // ===== PDF =====
  async getPdf(
    clave_acceso: string,
  ): Promise<{ pdfContent: Buffer; fileName: string }> {
    return await this.fileInvoiceService.getPdf(clave_acceso)
  }

  // ===== XML =====
  async getXml(
    clave_acceso: string,
  ): Promise<{ xmlContent: Buffer; fileName: string }> {
    return await this.fileInvoiceService.getXml(clave_acceso)
  }

  // ===== MÉTODOS DE UTILIDAD ADICIONALES =====

  // Obtener estado general del servicio
  async getServiceStatus(): Promise<{
    status: 'healthy' | 'warning' | 'error'
    services: {
      auth: { status: string; tokenValid: boolean }
      config: { status: string; hasCredentials: boolean }
      api: { status: string; connected: boolean }
    }
    lastChecked: Date
  }> {
    try {
      const authTokenInfo = this.authService.getTokenInfo()
      const credentialsStatus = this.configService.getCredentialsStatus()
      const apiConnection = await this.apiService.getConnectionStatus()

      const services = {
        auth: {
          status: authTokenInfo.hasToken ? 'active' : 'inactive',
          tokenValid: authTokenInfo.isValid,
        },
        config: {
          status: credentialsStatus.hasCredentials
            ? 'configured'
            : 'not_configured',
          hasCredentials: credentialsStatus.hasCredentials,
        },
        api: {
          status: apiConnection.connected ? 'connected' : 'disconnected',
          connected: apiConnection.connected,
        },
      }

      // Determinar estado general
      let status: 'healthy' | 'warning' | 'error' = 'healthy'

      if (!services.config.hasCredentials) {
        status = 'error'
      } else if (!services.api.connected || !services.auth.tokenValid) {
        status = 'warning'
      }

      return {
        status,
        services,
        lastChecked: new Date(),
      }
    } catch (error) {
      this.logger.error('Error al obtener estado del servicio:', error.message)
      return {
        status: 'error',
        services: {
          auth: { status: 'error', tokenValid: false },
          config: { status: 'error', hasCredentials: false },
          api: { status: 'error', connected: false },
        },
        lastChecked: new Date(),
      }
    }
  }

  // Método para reinicializar todos los servicios
  async reinitializeServices(): Promise<void> {
    try {
      this.logger.log('🔄 Reinicializando todos los servicios de billing...')

      // Invalidar token actual
      this.authService.invalidateToken()

      // Recargar credenciales
      await this.configService.reloadCredentials()

      this.logger.log('✅ Servicios de billing reinicializados exitosamente')
    } catch (error) {
      this.logger.error('❌ Error al reinicializar servicios:', error.message)
      throw new HttpException(
        'Error al reinicializar servicios de billing',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  // Método de diagnóstico completo
  async runDiagnostics(): Promise<{
    overall: 'pass' | 'warning' | 'fail'
    tests: {
      name: string
      status: 'pass' | 'warning' | 'fail'
      message: string
      details?: any
    }[]
  }> {
    const tests: any[] = []
    let overall: 'pass' | 'warning' | 'fail' = 'pass'

    try {
      // Test 1: Verificar credenciales
      try {
        const credentialsStatus = this.configService.getCredentialsStatus()
        if (credentialsStatus.hasCredentials) {
          tests.push({
            name: 'Credenciales de BD',
            status: 'pass',
            message: `Credenciales configuradas para: ${credentialsStatus.email}`,
          })
        } else {
          tests.push({
            name: 'Credenciales de BD',
            status: 'fail',
            message: 'No se encontraron credenciales configuradas',
          })
          overall = 'fail'
        }
      } catch (error) {
        tests.push({
          name: 'Credenciales de BD',
          status: 'fail',
          message: `Error al verificar credenciales: ${error.message}`,
        })
        overall = 'fail'
      }

      // Test 2: Verificar autenticación
      try {
        const token = await this.apiService.getValidToken()
        tests.push({
          name: 'Autenticación API',
          status: 'pass',
          message: 'Token obtenido exitosamente',
          details: { tokenLength: token.length },
        })
      } catch (error) {
        tests.push({
          name: 'Autenticación API',
          status: 'fail',
          message: `Error de autenticación: ${error.message}`,
        })
        overall = 'fail'
      }

      // Test 3: Verificar conexión a API
      try {
        const apiStatus = await this.apiService.getConnectionStatus()
        if (apiStatus.connected) {
          tests.push({
            name: 'Conexión API',
            status: 'pass',
            message: `Conectado a ${apiStatus.baseUrl}`,
          })
        } else {
          tests.push({
            name: 'Conexión API',
            status: 'warning',
            message: `No se pudo conectar a ${apiStatus.baseUrl}`,
            details: { lastError: apiStatus.lastError },
          })
          if (overall === 'pass') overall = 'warning'
        }
      } catch (error) {
        tests.push({
          name: 'Conexión API',
          status: 'fail',
          message: `Error de conexión: ${error.message}`,
        })
        overall = 'fail'
      }

      // Test 4: Verificar puntos de emisión
      try {
        const puntosEmision = await this.invoiceService.getPuntosEmision()
        if (puntosEmision.length > 0) {
          tests.push({
            name: 'Puntos de Emisión',
            status: 'pass',
            message: `${puntosEmision.length} punto(s) de emisión disponible(s)`,
            details: { puntos: puntosEmision.length },
          })
        } else {
          tests.push({
            name: 'Puntos de Emisión',
            status: 'warning',
            message: 'No se encontraron puntos de emisión configurados',
          })
          if (overall === 'pass') overall = 'warning'
        }
      } catch (error) {
        tests.push({
          name: 'Puntos de Emisión',
          status: 'fail',
          message: `Error al obtener puntos de emisión: ${error.message}`,
        })
        overall = 'fail'
      }

      // Test 5: Verificar perfil
      try {
        const profile = await this.profileService.getProfile()
        const profileComplete = await this.profileService.isProfileComplete()

        if (profileComplete.complete) {
          tests.push({
            name: 'Perfil Empresarial',
            status: 'pass',
            message: `Perfil completo para RUC: ${profile.ruc}`,
          })
        } else {
          tests.push({
            name: 'Perfil Empresarial',
            status: 'warning',
            message: `Perfil incompleto. Faltan: ${profileComplete.missingFields.join(', ')}`,
            details: { missingFields: profileComplete.missingFields },
          })
          if (overall === 'pass') overall = 'warning'
        }
      } catch (error) {
        tests.push({
          name: 'Perfil Empresarial',
          status: 'fail',
          message: `Error al verificar perfil: ${error.message}`,
        })
        overall = 'fail'
      }

      // Test 6: Verificar firma digital
      try {
        const signatureStatus = await this.signatureService.getSignatureStatus()
        if (signatureStatus.hasSignature) {
          if (signatureStatus.isValid) {
            tests.push({
              name: 'Firma Digital',
              status: 'pass',
              message: `Firma válida. Expira en ${signatureStatus.daysUntilExpiry} días`,
              details: {
                expiresAt: signatureStatus.expiresAt,
                daysUntilExpiry: signatureStatus.daysUntilExpiry,
              },
            })
          } else {
            tests.push({
              name: 'Firma Digital',
              status: 'warning',
              message: 'Firma digital expirada',
            })
            if (overall === 'pass') overall = 'warning'
          }
        } else {
          tests.push({
            name: 'Firma Digital',
            status: 'warning',
            message: 'No hay firma digital configurada',
          })
          if (overall === 'pass') overall = 'warning'
        }
      } catch (error) {
        tests.push({
          name: 'Firma Digital',
          status: 'fail',
          message: `Error al verificar firma: ${error.message}`,
        })
        overall = 'fail'
      }
    } catch (error) {
      this.logger.error('Error durante diagnósticos:', error.message)
      tests.push({
        name: 'Sistema General',
        status: 'fail',
        message: `Error crítico durante diagnósticos: ${error.message}`,
      })
      overall = 'fail'
    }

    this.logger.log(`Diagnósticos completados. Estado general: ${overall}`)

    return {
      overall,
      tests,
    }
  }
}
