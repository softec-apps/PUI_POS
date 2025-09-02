import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CustomerSeedService } from '@/database/seeds/relational/customer/customer-seed.service'
import { CustomerEntity } from '@/modules/customer/infrastructure/persistence/relational/entities/customer.entity'

@Module({
  imports: [TypeOrmModule.forFeature([CustomerEntity])],
  providers: [CustomerSeedService],
  exports: [CustomerSeedService],
})
export class CustomerSeedModule {}
