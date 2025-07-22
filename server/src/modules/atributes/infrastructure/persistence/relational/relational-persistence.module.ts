import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AtributeRepository } from '@/modules/atributes/infrastructure/persistence/atribute.repository'
import { AtributeEntity } from '@/modules/atributes/infrastructure/persistence/relational/entities/atribute.entity'
import { AtributesRelationalRepository } from '@/modules/atributes/infrastructure/persistence/relational/repositories/atribute.repository'

@Module({
  imports: [TypeOrmModule.forFeature([AtributeEntity])],
  providers: [
    {
      provide: AtributeRepository,
      useClass: AtributesRelationalRepository,
    },
  ],
  exports: [AtributeRepository],
})
export class RelationalAtributePersistenceModule {}
