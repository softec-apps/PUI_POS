import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SupplierRepository } from '@/modules/suppliers/infrastructure/persistence/supplier.repository'
import { BrandEntity } from '@/modules/brand/infrastructure/persistence/relational/entities/brand.entity'
import { SupplierEntity } from '@/modules/suppliers/infrastructure/persistence/relational/entities/supplier.entity'
import { SupplierRelationalRepository } from '@/modules/suppliers/infrastructure/persistence/relational/repositories/supplier.repository'

@Module({
  imports: [TypeOrmModule.forFeature([SupplierEntity, BrandEntity])],
  providers: [
    {
      provide: SupplierRepository,
      useClass: SupplierRelationalRepository,
    },
  ],
  exports: [SupplierRepository],
})
export class RelationalSupplierPersistenceModule {}
