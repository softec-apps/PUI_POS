import { AxiosError } from 'axios'
import { firstValueFrom } from 'rxjs'
import { HttpService } from '@nestjs/axios'
import { BillingAuthService } from '@/modules/factuZen/services/auth.service'
import { BillingConfigService } from '@/modules/factuZen/services/config.service'
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common'

@Injectable()
export class BillingApiService {
  private readonly logger = new Logger(BillingApiService.name)

  constructor(
    private readonly httpService: HttpService,
    private readonly billingAuthService: BillingAuthService,
    private readonly billingConfigService: BillingConfigService,
    private readonly baseUrl: string,
  ) {}

  // Obtener token válido (renovar si es necesario)
  async getValidToken(): Promise<string> {
    if (!this.billingAuthService.isTokenValid()) {
      this.logger.log('Token inválido o expirado, renovando...')

      const credentials = await this.billingConfigService.ensureCredentials()
      await this.billingAuthService.authenticate(credentials)
    } else {
      this.logger.log('Token válido encontrado')
    }

    return this.billingAuthService.getToken()!
  }

  // Realizar petición con manejo automático de autenticación
  async makeAuthenticatedRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    config?: any,
  ): Promise<T> {
    const token = await this.getValidToken()

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...config?.headers,
    }

    try {
      let response
      const requestConfig = {
        ...config,
        headers,
        timeout: config?.timeout || 10000,
      }

      this.logger.log(`📤 ${method} request to: ${this.baseUrl}${endpoint}`)

      switch (method) {
        case 'GET':
          response = await firstValueFrom(
            this.httpService.get(`${this.baseUrl}${endpoint}`, requestConfig),
          )
          break
        case 'POST':
          response = await firstValueFrom(
            this.httpService.post(
              `${this.baseUrl}${endpoint}`,
              data,
              requestConfig,
            ),
          )
          break
        case 'PUT':
          response = await firstValueFrom(
            this.httpService.put(
              `${this.baseUrl}${endpoint}`,
              data,
              requestConfig,
            ),
          )
          break
        case 'DELETE':
          response = await firstValueFrom(
            this.httpService.delete(
              `${this.baseUrl}${endpoint}`,
              requestConfig,
            ),
          )
          break
      }

      this.logger.log(
        `✅ ${method} request successful - Status: ${response.status}`,
      )
      return response.data
    } catch (error) {
      this.logger.error(`❌ Error en ${method} request:`, error.message)

      if (error instanceof AxiosError) {
        this.logger.error('📋 Detalles del error HTTP:')
        this.logger.error(`- Status: ${error.response?.status}`)
        this.logger.error(`- StatusText: ${error.response?.statusText}`)
        this.logger.error(`- URL: ${error.config?.url}`)
        this.logger.error(`- Method: ${error.config?.method}`)
        this.logger.error(`- Response Data:`, error.response?.data)
      }

      // Si el error es de autenticación, intentar una vez más
      if (error.response?.status === 401) {
        this.logger.log('🔄 Token expirado, renovando e intentando de nuevo...')
        this.billingAuthService.invalidateToken()

        try {
          const newToken = await this.getValidToken()
          const retryHeaders = {
            ...headers,
            Authorization: `Bearer ${newToken}`,
          }
          const retryConfig = { ...config, headers: retryHeaders }

          this.logger.log(
            `🔄 Retry ${method} request to: ${this.baseUrl}${endpoint}`,
          )

          let retryResponse
          switch (method) {
            case 'GET':
              retryResponse = await firstValueFrom(
                this.httpService.get(`${this.baseUrl}${endpoint}`, retryConfig),
              )
              break
            case 'POST':
              retryResponse = await firstValueFrom(
                this.httpService.post(
                  `${this.baseUrl}${endpoint}`,
                  data,
                  retryConfig,
                ),
              )
              break
            case 'PUT':
              retryResponse = await firstValueFrom(
                this.httpService.put(
                  `${this.baseUrl}${endpoint}`,
                  data,
                  retryConfig,
                ),
              )
              break
            case 'DELETE':
              retryResponse = await firstValueFrom(
                this.httpService.delete(
                  `${this.baseUrl}${endpoint}`,
                  retryConfig,
                ),
              )
              break
          }

          this.logger.log(
            `✅ ${method} request successful on retry - Status: ${retryResponse.status}`,
          )
          return retryResponse.data
        } catch (retryError) {
          this.logger.error(
            `❌ Error en segundo intento ${method}:`,
            retryError.message,
          )
          if (retryError instanceof AxiosError) {
            this.logger.error(
              '📋 Retry error response:',
              retryError.response?.data,
            )
          }
          throw new HttpException(
            `Error en petición ${method} después de renovar token: ${retryError.response?.data?.message || retryError.message}`,
            retryError.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
          )
        }
      }

      // Para otros errores, lanzar HttpException apropiada
      const statusCode =
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
      const message =
        error.response?.data?.message ||
        error.message ||
        `Error en petición ${method}`

      throw new HttpException(message, statusCode)
    }
  }

  // Método específico para peticiones con FormData
  async makeFormDataRequest<T>(
    method: 'POST' | 'PUT',
    endpoint: string,
    formData: FormData,
    config?: any,
  ): Promise<T> {
    const token = await this.getValidToken()

    const headers = {
      Authorization: `Bearer ${token}`,
      // No establecer Content-Type para FormData, el browser lo hace automáticamente
      Accept: 'application/json',
      ...config?.headers,
    }

    // Eliminar Content-Type si fue establecido
    delete headers['Content-Type']

    try {
      let response
      const requestConfig = {
        ...config,
        headers,
        timeout: config?.timeout || 30000,
      }

      this.logger.log(
        `📤 ${method} FormData request to: ${this.baseUrl}${endpoint}`,
      )

      switch (method) {
        case 'POST':
          response = await firstValueFrom(
            this.httpService.post(
              `${this.baseUrl}${endpoint}`,
              formData,
              requestConfig,
            ),
          )
          break
        case 'PUT':
          response = await firstValueFrom(
            this.httpService.put(
              `${this.baseUrl}${endpoint}`,
              formData,
              requestConfig,
            ),
          )
          break
      }

      this.logger.log(
        `✅ ${method} FormData request successful - Status: ${response.status}`,
      )
      return response.data
    } catch (error) {
      this.logger.error(
        `❌ Error en ${method} FormData request:`,
        error.message,
      )

      // Si el error es de autenticación, intentar una vez más
      if (error.response?.status === 401) {
        this.logger.log(
          '🔄 Token expirado, renovando e intentando FormData de nuevo...',
        )
        this.billingAuthService.invalidateToken()

        try {
          const newToken = await this.getValidToken()
          const retryHeaders = {
            ...headers,
            Authorization: `Bearer ${newToken}`,
          }
          const retryConfig = { ...config, headers: retryHeaders }

          let retryResponse
          switch (method) {
            case 'POST':
              retryResponse = await firstValueFrom(
                this.httpService.post(
                  `${this.baseUrl}${endpoint}`,
                  formData,
                  retryConfig,
                ),
              )
              break
            case 'PUT':
              retryResponse = await firstValueFrom(
                this.httpService.put(
                  `${this.baseUrl}${endpoint}`,
                  formData,
                  retryConfig,
                ),
              )
              break
          }

          this.logger.log(`✅ ${method} FormData request successful on retry`)
          return retryResponse.data
        } catch (retryError) {
          this.logger.error(
            `❌ Error en segundo intento ${method} FormData:`,
            retryError.message,
          )
          throw new HttpException(
            `Error en petición FormData después de renovar token: ${retryError.response?.data?.message || retryError.message}`,
            retryError.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
          )
        }
      }

      throw error
    }
  }

  // Método para peticiones que retornan datos binarios (como PDFs)
  async makeBinaryRequest(
    endpoint: string,
    config?: any,
  ): Promise<{ data: ArrayBuffer; headers: any }> {
    const token = await this.getValidToken()

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...config?.headers,
    }

    try {
      const requestConfig = {
        ...config,
        headers,
        responseType: 'arraybuffer' as const,
        timeout: config?.timeout || 15000,
      }

      this.logger.log(`📄 Binary request to: ${this.baseUrl}${endpoint}`)

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}${endpoint}`, requestConfig),
      )

      this.logger.log(
        `✅ Binary request successful - Status: ${response.status}`,
      )
      return {
        data: response.data,
        headers: response.headers,
      }
    } catch (error) {
      this.logger.error('❌ Error en binary request:', error.message)

      // Si el error es de autenticación, intentar una vez más
      if (error.response?.status === 401) {
        this.logger.log(
          '🔄 Token expirado, renovando e intentando binary request de nuevo...',
        )
        this.billingAuthService.invalidateToken()

        try {
          const newToken = await this.getValidToken()
          const retryHeaders = {
            ...headers,
            Authorization: `Bearer ${newToken}`,
          }
          const retryConfig = {
            ...config,
            headers: retryHeaders,
            responseType: 'arraybuffer' as const,
          }

          const retryResponse = await firstValueFrom(
            this.httpService.get(`${this.baseUrl}${endpoint}`, retryConfig),
          )

          this.logger.log('✅ Binary request successful on retry')
          return {
            data: retryResponse.data,
            headers: retryResponse.headers,
          }
        } catch (retryError) {
          this.logger.error(
            '❌ Error en segundo intento binary request:',
            retryError.message,
          )
          throw new HttpException(
            `Error en petición binaria después de renovar token: ${retryError.response?.data?.message || retryError.message}`,
            retryError.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
          )
        }
      }

      throw error
    }
  }

  // Método para obtener información del estado de conexión
  async getConnectionStatus(): Promise<{
    connected: boolean
    tokenValid: boolean
    baseUrl: string
    lastError?: string
  }> {
    try {
      await this.getValidToken()
      return {
        connected: true,
        tokenValid: this.billingAuthService.isTokenValid(),
        baseUrl: this.baseUrl,
      }
    } catch (error) {
      return {
        connected: false,
        tokenValid: false,
        baseUrl: this.baseUrl,
        lastError: error.message,
      }
    }
  }
}
