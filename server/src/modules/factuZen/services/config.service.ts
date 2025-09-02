import {
  Injectable,
  HttpException,
  HttpStatus,
  Logger,
  OnModuleInit,
} from '@nestjs/common'
import { BillingRepository } from '@/modules/factuZen/repositories/billing.repository'
import { BillingDomain } from '@/modules/factuZen/domain/billing.domain'
import {
  CreateBillingDto,
  UpdateBillingDto,
} from '@/modules/factuZen/dto/auth.dto'
import { BillingAuthService } from '@/modules/factuZen/services/auth.service'

@Injectable()
export class BillingConfigService implements OnModuleInit {
  private readonly logger = new Logger(BillingConfigService.name)
  private currentCredentials: { email: string; password: string } | null = null

  constructor(
    private readonly billingRepository: BillingRepository,
    private readonly billingAuthService: BillingAuthService,
  ) {}

  async onModuleInit() {
    await this.loadCredentials()
  }

  // Cargar credenciales desde la base de datos
  async loadCredentials(): Promise<void> {
    try {
      this.logger.log('🔍 Cargando credenciales desde la BD...')

      const billingConfig = await this.billingRepository.findFirst()

      this.logger.log('📋 Resultado de findFirst():', billingConfig)

      if (billingConfig) {
        this.currentCredentials = {
          email: billingConfig.email,
          password: billingConfig.password,
        }
        this.logger.log(`✅ Credenciales cargadas para: ${billingConfig.email}`)
        this.logger.log(
          `🔑 Password length: ${billingConfig.password?.length || 0}`,
        )
      } else {
        this.logger.warn(
          '⚠️ No se encontraron credenciales de billing en la BD (findFirst returned null/undefined)',
        )

        // Intentar obtener todas las configuraciones para debug
        try {
          const allConfigs = await this.billingRepository.findAll()
          this.logger.log(
            `📊 Total de configuraciones en BD: ${allConfigs?.length || 0}`,
          )

          if (allConfigs && allConfigs.length > 0) {
            this.logger.log('📋 Primera configuración encontrada:', {
              id: allConfigs[0].id,
              email: allConfigs[0].email,
              hasPassword: !!allConfigs[0].password,
              createdAt: allConfigs[0].createdAt,
            })

            // Usar la primera configuración encontrada
            this.currentCredentials = {
              email: allConfigs[0].email,
              password: allConfigs[0].password,
            }
            this.logger.log(
              `✅ Usando primera configuración encontrada: ${allConfigs[0].email}`,
            )
          }
        } catch (findAllError) {
          this.logger.error(
            '❌ Error al intentar findAll():',
            findAllError.message,
          )
        }
      }
    } catch (error) {
      this.logger.error('❌ Error al cargar credenciales:', error.message)
      this.logger.error('📋 Stack trace:', error.stack)
    }
  }

  // Gestión de credenciales
  async createBillingConfig(
    createBillingDto: CreateBillingDto,
  ): Promise<BillingDomain> {
    const billingConfig = await this.billingRepository.create(
      createBillingDto.email,
      createBillingDto.password,
    )

    // Actualizar credenciales en memoria
    this.currentCredentials = {
      email: billingConfig.email,
      password: billingConfig.password,
    }

    // Invalidar token actual para forzar nueva autenticación
    this.billingAuthService.invalidateToken()

    this.logger.log(
      `Nueva configuración de billing creada para: ${billingConfig.email}`,
    )
    return billingConfig
  }

  async updateBillingConfig(
    id: string,
    updateBillingDto: UpdateBillingDto,
  ): Promise<BillingDomain> {
    const updatedConfig = await this.billingRepository.update(
      id,
      updateBillingDto.email,
      updateBillingDto.password,
    )

    if (!updatedConfig) {
      throw new HttpException(
        'Configuración de billing no encontrada',
        HttpStatus.NOT_FOUND,
      )
    }

    // Actualizar credenciales en memoria
    this.currentCredentials = {
      email: updatedConfig.email,
      password: updatedConfig.password,
    }

    // Invalidar token actual
    this.billingAuthService.invalidateToken()

    this.logger.log(
      `Configuración de billing actualizada para: ${updatedConfig.email}`,
    )
    return updatedConfig
  }

  async getAllBillingConfigs(): Promise<BillingDomain[]> {
    return this.billingRepository.findAll()
  }

  async deleteBillingConfig(id: string): Promise<boolean> {
    const deleted = await this.billingRepository.delete(id)
    if (deleted) {
      // Si se eliminó la configuración actual, recargar credenciales
      await this.loadCredentials()
      this.billingAuthService.invalidateToken()
      this.logger.log('Configuración de billing eliminada')
    }
    return deleted
  }

  // Método para forzar recarga de credenciales
  async reloadCredentials(): Promise<void> {
    this.logger.log('🔄 Forzando recarga de credenciales...')
    this.currentCredentials = null
    this.billingAuthService.invalidateToken()
    await this.loadCredentials()
  }

  // Obtener credenciales actuales
  getCurrentCredentials(): { email: string; password: string } | null {
    return this.currentCredentials
  }

  // Verificar estado de credenciales
  getCredentialsStatus(): { hasCredentials: boolean; email?: string } {
    return {
      hasCredentials: !!this.currentCredentials,
      email: this.currentCredentials?.email,
    }
  }

  // Método para verificar si las credenciales están disponibles
  async ensureCredentials(): Promise<{ email: string; password: string }> {
    if (!this.currentCredentials) {
      this.logger.warn(
        '⚠️ No hay credenciales cargadas, intentando recargar...',
      )
      await this.loadCredentials()
    }

    if (!this.currentCredentials) {
      this.logger.error(
        '❌ No se pudieron cargar credenciales después del intento de recarga',
      )
      throw new HttpException(
        'No hay credenciales de billing configuradas',
        HttpStatus.PRECONDITION_FAILED,
      )
    }

    return this.currentCredentials
  }
}
