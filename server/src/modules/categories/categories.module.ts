import { forwardRef, Module } from '@nestjs/common'
import { FilesModule } from '@/modules/files/files.module'
import { TemplateProductModule } from '@/modules/template/templates.module'
import { CategoriesService } from '@/modules/categories/categories.service'
import { CategoryController } from '@/modules/categories/categories.controller'
import { RelationalCategoryPersistenceModule } from '@/modules/categories/infrastructure/persistence/relational/relational-persistence.module'

const infrastructurePersistenceModule = RelationalCategoryPersistenceModule

@Module({
  imports: [
    infrastructurePersistenceModule,
    FilesModule,
    forwardRef(() => TemplateProductModule),
  ],
  controllers: [CategoryController],
  providers: [CategoriesService],
  exports: [CategoriesService, infrastructurePersistenceModule],
})
export class CategoriesModule {}
