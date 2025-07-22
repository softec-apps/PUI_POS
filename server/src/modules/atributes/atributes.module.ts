import { forwardRef, Module } from '@nestjs/common'
import { AtributesService } from '@/modules/atributes/atributes.service'
import { TemplateProductModule } from '@/modules//template/templates.module'
import { AtributeController } from '@/modules/atributes/atributes.controller'
import { RelationalAtributePersistenceModule } from '@/modules/atributes/infrastructure/persistence/relational/relational-persistence.module'

const infrastructurePersistenceModule = RelationalAtributePersistenceModule

@Module({
  imports: [
    infrastructurePersistenceModule,
    forwardRef(() => TemplateProductModule),
  ],
  controllers: [AtributeController],
  providers: [AtributesService],
  exports: [AtributesService, infrastructurePersistenceModule],
})
export class AttributesModule {}
