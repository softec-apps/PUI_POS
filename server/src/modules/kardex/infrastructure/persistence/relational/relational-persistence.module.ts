import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { KardexRepository } from '@/modules/kardex/infrastructure/persistence/kardex.repository'
import { UserEntity } from '@/modules/users/infrastructure/persistence/relational/entities/user.entity'
import { KardexEntity } from '@/modules/kardex/infrastructure/persistence/relational/entities/kardex.entity'
import { ProductEntity } from '@/modules/product/infrastructure/persistence/relational/entities/product.entity'
import { kardexRelationalRepository } from '@/modules/kardex/infrastructure/persistence/relational/repositories/kardex.repository'

@Module({
  imports: [
    TypeOrmModule.forFeature([KardexEntity, UserEntity, ProductEntity]),
  ],
  providers: [
    {
      provide: KardexRepository,
      useClass: kardexRelationalRepository,
    },
  ],
  exports: [KardexRepository],
})
export class RelationalKardexPersistenceModule {}
