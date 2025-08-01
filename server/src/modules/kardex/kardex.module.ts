import { forwardRef, Module } from '@nestjs/common'
import { UsersModule } from '@/modules/users/users.module'
import { KardexService } from '@/modules/kardex/kardex.service'
import { ProductModule } from '@/modules/product/product.module'
import { KardexController } from '@/modules/kardex/kardex.controller'
import { RelationalKardexPersistenceModule } from '@/modules/kardex/infrastructure/persistence/relational/relational-persistence.module'

const infrastructurePersistenceModule = RelationalKardexPersistenceModule

@Module({
  imports: [
    infrastructurePersistenceModule,
    forwardRef(() => ProductModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [KardexController],
  providers: [KardexService],
  exports: [KardexService, infrastructurePersistenceModule],
})
export class KardexModule {}
