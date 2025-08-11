import { Module } from '@nestjs/common'
import { FilesModule } from '@/modules/files/files.module'
import { SessionModule } from '@/modules/session/session.module'
import { UsersService } from '@/modules/users/users.service'
import { UsersController } from '@/modules/users/users.controller'
import { RelationalUserPersistenceModule } from '@/modules/users/infrastructure/persistence/relational/relational-persistence.module'

const infrastructurePersistenceModule = RelationalUserPersistenceModule

@Module({
  imports: [infrastructurePersistenceModule, FilesModule, SessionModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, infrastructurePersistenceModule],
})
export class UsersModule {}
