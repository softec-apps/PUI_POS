import { AxiosError } from 'axios'
import { firstValueFrom } from 'rxjs'
import { HttpService } from '@nestjs/axios'
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { LoginDto, AuthResponseDto } from '@/modules/factuZen/dto/auth.dto'

@Injectable()
export class BillingAuthService {
  private readonly logger = new Logger(BillingAuthService.name)
  private authToken: string | null = null
  private tokenExpiry: Date | null = null

  constructor(
    private readonly httpService: HttpService,
    private readonly baseUrl: string,
  ) {}

  // Método para autenticar y obtener token
  async authenticate(credentials: {
    email: string
    password: string
  }): Promise<AuthResponseDto> {
    this.logger.log(`🔐 Intentando autenticar con email: ${credentials.email}`)

    try {
      const loginData: LoginDto = {
        email: credentials.email,
        password: credentials.password,
      }

      this.logger.log(`📤 Enviando petición POST a: ${this.baseUrl}/login`)

      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/login`, loginData, {
          timeout: 10000,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'NestJS-BillingService/1.0',
          },
        }),
      )

      this.logger.log('✅ Autenticación exitosa')

      const apiResponse = response.data
      if (!apiResponse.success || !apiResponse.data) {
        throw new Error('Formato de respuesta inválido')
      }

      const authResponse: AuthResponseDto = {
        token: apiResponse.data.token,
        user_id: apiResponse.data.user_id,
        token_expires_at: apiResponse.data.token_expires_at,
        signature_expires_at: apiResponse.data.signature_expires_at,
      }

      // Guardar token
      this.authToken = authResponse.token

      // Calcular expiración del token
      if (authResponse.token_expires_at) {
        this.tokenExpiry = new Date(authResponse.token_expires_at)
        const bufferTime = new Date(this.tokenExpiry.getTime() - 5 * 60 * 1000)
        this.tokenExpiry = bufferTime
        this.logger.log(
          `🕒 Token válido hasta: ${this.tokenExpiry.toISOString()}`,
        )
      } else {
        this.tokenExpiry = new Date(Date.now() + 8 * 60 * 60 * 1000)
        this.logger.log(
          `🕒 Token válido hasta: ${this.tokenExpiry.toISOString()} (por defecto - 8 horas)`,
        )
      }

      return authResponse
    } catch (error) {
      this.logger.error('❌ Error en autenticación:', error.message)

      if (error instanceof AxiosError) {
        this.logger.error('📋 Detalles del error HTTP:')
        this.logger.error(`- Status: ${error.response?.status}`)
        this.logger.error(`- Response Data:`, error.response?.data)

        if (error.code === 'ECONNREFUSED') {
          this.logger.error(
            '🔴 Conexión rechazada - Verifica que Laravel esté corriendo en el puerto 8000',
          )
        }
        if (error.code === 'ETIMEDOUT') {
          this.logger.error('🔴 Timeout - La API de Laravel no responde')
        }
      }

      throw new HttpException(
        `Error al autenticar con la API de facturación: ${error.response?.data?.message || error.message}`,
        error.response?.status || HttpStatus.UNAUTHORIZED,
      )
    }
  }

  // Verificar si el token es válido
  isTokenValid(): boolean {
    if (!this.authToken) {
      this.logger.log('🔍 Token no existe')
      return false
    }

    if (this.tokenExpiry && new Date() >= this.tokenExpiry) {
      this.logger.log('🔍 Token expirado')
      return false
    }

    this.logger.log('🔍 Token es válido')
    return true
  }

  // Obtener token actual
  getToken(): string | null {
    return this.authToken
  }

  // Invalidar token actual
  invalidateToken(): void {
    this.authToken = null
    this.tokenExpiry = null
    this.logger.log('🔄 Token invalidado')
  }

  // Obtener información del token
  getTokenInfo(): {
    hasToken: boolean
    isValid: boolean
    expiresAt: Date | null
    timeLeft: number | null
  } {
    return {
      hasToken: !!this.authToken,
      isValid: this.isTokenValid(),
      expiresAt: this.tokenExpiry,
      timeLeft: this.tokenExpiry
        ? Math.round((this.tokenExpiry.getTime() - Date.now()) / 1000)
        : null,
    }
  }
}
