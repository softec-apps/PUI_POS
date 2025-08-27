import { forwardRef, Module } from '@nestjs/common'
import { CustomerModule } from '@/modules/customer/customer.module'
import { ProductModule } from '@/modules/product/product.module'
import { SaleService } from '@/modules/sales/sale.service'
import { SaleController } from '@/modules/sales/sale.controller'
import { RelationalSalePersistenceModule } from '@/modules/sales/infrastructure/persistence/relational/relational-persistence.module'

const infrastructurePersistenceModule = RelationalSalePersistenceModule

@Module({
  imports: [
    infrastructurePersistenceModule,
    forwardRef(() => CustomerModule),
    forwardRef(() => ProductModule),
  ],
  controllers: [SaleController],
  providers: [SaleService],
  exports: [SaleService, infrastructurePersistenceModule],
})
export class SaleModule {}
