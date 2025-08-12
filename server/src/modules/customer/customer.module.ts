import { forwardRef, Module } from '@nestjs/common'
import { CustomerService } from '@/modules/customer/customer.service'
import { CustomerController } from '@/modules/customer/customer.controller'
import { SupplierModule } from '@/modules/suppliers/supplier.module'
import { RelationalCustomerPersistenceModule } from '@/modules/customer/infrastructure/persistence/relational/relational-persistence.module'

const infrastructurePersistenceModule = RelationalCustomerPersistenceModule

@Module({
  imports: [infrastructurePersistenceModule, forwardRef(() => SupplierModule)],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService, infrastructurePersistenceModule],
})
export class CustomerModule {}
