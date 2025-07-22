import { forwardRef, Module } from '@nestjs/common'
import { AttributesModule } from '@/modules/atributes/atributes.module'
import { CategoriesModule } from '@/modules/categories/categories.module'
import { TemplateProductService } from '@/modules/template/templates.service'
import { TemplateProductController } from '@/modules/template/templates.controller'
import { RelationalTemplatePersistenceModule } from '@/modules/template/infrastructure/persistence/relational/relational-persistence.module'

const infrastructurePersistenceModule = RelationalTemplatePersistenceModule

@Module({
  imports: [
    infrastructurePersistenceModule,
    forwardRef(() => AttributesModule),
    forwardRef(() => CategoriesModule),
  ],
  controllers: [TemplateProductController],
  providers: [TemplateProductService],
  exports: [TemplateProductService, infrastructurePersistenceModule],
})
export class TemplateProductModule {}
