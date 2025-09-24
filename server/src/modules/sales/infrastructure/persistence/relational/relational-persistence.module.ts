import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SaleRepository } from '@/modules/sales/infrastructure/persistence/sale.repository'
import { SaleEntity } from '@/modules/sales/infrastructure/persistence/relational/entities/sale.entity'
import { CustomerEntity } from '@/modules/customer/infrastructure/persistence/relational/entities/customer.entity'
import { ProductEntity } from '@/modules/product/infrastructure/persistence/relational/entities/product.entity'
import { SaleRelationalRepository } from '@/modules/sales/infrastructure/persistence/relational/repositories/sale.repository'
import { UserEntity } from '@/modules/users/infrastructure/persistence/relational/entities/user.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SaleEntity,
      CustomerEntity,
      ProductEntity,
      UserEntity,
    ]),
  ],
  providers: [
    {
      provide: SaleRepository,
      useClass: SaleRelationalRepository,
    },
  ],
  exports: [SaleRepository],
})
export class RelationalSalePersistenceModule {}
