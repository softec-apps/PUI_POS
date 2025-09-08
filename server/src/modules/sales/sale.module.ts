import { forwardRef, Module } from '@nestjs/common'
import { CustomerModule } from '@/modules/customer/customer.module'
import { ProductModule } from '@/modules/product/product.module'
import { BillingModule } from '@/modules/factuZen/billing.module'
import { EstablishmentModule } from '@/modules/establishment/establishment.module'
import { SaleService } from '@/modules/sales/sale.service'
import { SaleController } from '@/modules/sales/sale.controller'
import { RelationalSalePersistenceModule } from '@/modules/sales/infrastructure/persistence/relational/relational-persistence.module'
import { HttpModule } from '@nestjs/axios'
import { BullModule } from '@nestjs/bullmq'
import { QUEUE } from '@/common/constants/queue.const'
import { QueuesModule } from '../queues/queues.module'
import { BillingWorker } from '../factuZen/billing.worker'

const infrastructurePersistenceModule = RelationalSalePersistenceModule

@Module({
  imports: [
    HttpModule,
    QueuesModule,
    infrastructurePersistenceModule,
    forwardRef(() => CustomerModule),
    forwardRef(() => ProductModule),
    forwardRef(() => BillingModule),
    forwardRef(() => EstablishmentModule),
    BullModule.registerQueue({
      name: QUEUE.VOUCHER,
    }),
  ],
  controllers: [SaleController],
  providers: [BillingWorker, SaleService],
  exports: [SaleService, infrastructurePersistenceModule],
})
export class SaleModule {}
