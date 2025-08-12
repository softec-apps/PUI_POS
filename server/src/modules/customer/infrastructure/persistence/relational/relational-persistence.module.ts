import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CustomerRepository } from '@/modules/customer/infrastructure/persistence/customer.repository'
import { CustomerEntity } from '@/modules/customer/infrastructure/persistence/relational/entities/customer.entity'
import { CustomerRelationalRepository } from '@/modules/customer/infrastructure/persistence/relational/repositories/customer.repository'

@Module({
  imports: [TypeOrmModule.forFeature([CustomerEntity])],
  providers: [
    {
      provide: CustomerRepository,
      useClass: CustomerRelationalRepository,
    },
  ],
  exports: [CustomerRepository],
})
export class RelationalCustomerPersistenceModule {}
