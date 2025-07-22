import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BrandRepository } from '@/modules/brand/infrastructure/persistence/brand.repository'
import { BrandEntity } from '@/modules/brand/infrastructure/persistence/relational/entities/brand.entity'
import { SupplierEntity } from '@/modules/suppliers/infrastructure/persistence/relational/entities/supplier.entity'
import { BrandRelationalRepository } from '@/modules/brand/infrastructure/persistence/relational/repositories/brand.repository'

@Module({
  imports: [TypeOrmModule.forFeature([BrandEntity, SupplierEntity])],
  providers: [
    {
      provide: BrandRepository,
      useClass: BrandRelationalRepository,
    },
  ],
  exports: [BrandRepository],
})
export class RelationalBrandPersistenceModule {}
