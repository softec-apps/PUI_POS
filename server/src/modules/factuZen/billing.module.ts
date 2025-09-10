import { TypeOrmModule } from '@nestjs/typeorm'
import { forwardRef, Module, Provider } from '@nestjs/common'
import { HttpModule, HttpService } from '@nestjs/axios'

// Servicios
import { BillingService } from '@/modules/factuZen/services/factuZen.service'
import { BillingAuthService } from '@/modules/factuZen/services/auth.service'
import { BillingConfigService } from '@/modules/factuZen/services/config.service'
import { BillingApiService } from '@/modules/factuZen/services/api.service'
import { BillingInvoiceService } from '@/modules/factuZen/services/billing.service'
import { BillingProfileService } from '@/modules/factuZen/services/profile.service'
import { BillingSignatureService } from '@/modules/factuZen/services/signature.service'
import { BillingFileInvoiceService } from '@/modules/factuZen/services/fileInvoice.service'

import { BillingController } from '@/modules/factuZen/billing.controller'

// Workers
import { BillingWorker } from '@/modules/factuZen/billing.worker'

// Repository
import { BillingRepository } from '@/modules/factuZen/repositories/billing.repository'

// Entidades
import { BillingEntity } from '@/modules/factuZen/entities/billing.entity'
import { SaleEntity } from '@/modules/sales/infrastructure/persistence/relational/entities/sale.entity'

import { BullModule } from '@nestjs/bullmq'
import { QUEUE } from '@/common/constants/queue.const'
import { SaleModule } from '@/modules/sales/sale.module'

// Configuración
const BILLING_BASE_URL = 'https://facturacion.torre-estevez.com'

// Providers con inyección de dependencias explícita
const billingProviders: Provider[] = [
  // Repository
  BillingRepository,

  // Worker
  BillingWorker,

  // Servicio de autenticación
  {
    provide: BillingAuthService,
    useFactory: (httpService: HttpService) =>
      new BillingAuthService(httpService, BILLING_BASE_URL),
    inject: [HttpService],
  },

  // Servicio de configuración
  {
    provide: BillingConfigService,
    useFactory: (
      repository: BillingRepository,
      authService: BillingAuthService,
    ) => new BillingConfigService(repository, authService),
    inject: [BillingRepository, BillingAuthService],
  },

  // Servicio de API
  {
    provide: BillingApiService,
    useFactory: (
      httpService: HttpService,
      authService: BillingAuthService,
      configService: BillingConfigService,
    ) =>
      new BillingApiService(
        httpService,
        authService,
        configService,
        BILLING_BASE_URL,
      ),
    inject: [HttpService, BillingAuthService, BillingConfigService],
  },

  // Servicios de negocio
  {
    provide: BillingInvoiceService,
    useFactory: (apiService: BillingApiService) =>
      new BillingInvoiceService(apiService),
    inject: [BillingApiService],
  },
  {
    provide: BillingProfileService,
    useFactory: (apiService: BillingApiService) =>
      new BillingProfileService(apiService),
    inject: [BillingApiService],
  },
  {
    provide: BillingSignatureService,
    useFactory: (apiService: BillingApiService) =>
      new BillingSignatureService(apiService),
    inject: [BillingApiService],
  },
  {
    provide: BillingFileInvoiceService,
    useFactory: (apiService: BillingApiService, httpService: HttpService) =>
      new BillingFileInvoiceService(apiService, httpService),
    inject: [BillingApiService, HttpService],
  },

  // Servicio principal
  {
    provide: BillingService,
    useFactory: (httpService: HttpService, repository: BillingRepository) =>
      new BillingService(httpService, repository),
    inject: [HttpService, BillingRepository],
  },
]

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 3,
    }),
    BullModule.registerQueue({
      name: QUEUE.VOUCHER,
    }),
    TypeOrmModule.forFeature([BillingEntity, SaleEntity]),
    forwardRef(() => SaleModule),
  ],
  controllers: [BillingController],
  providers: billingProviders,
  exports: [
    BillingService,
    BillingInvoiceService,
    BillingProfileService,
    BillingSignatureService,
    BillingFileInvoiceService,
    BillingAuthService,
    BillingConfigService,
    BillingApiService,
    BillingRepository,
    TypeOrmModule,
    BillingWorker,
  ],
})
export class BillingModule {}
