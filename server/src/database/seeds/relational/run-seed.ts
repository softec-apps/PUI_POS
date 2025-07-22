import { NestFactory } from '@nestjs/core'
import { SeedModule } from '@/database/seeds/relational/seed.module'
import { UserSeedService } from '@/database/seeds/relational/user/user-seed.service'
import { RoleSeedService } from '@/database/seeds/relational/role/role-seed.service'
import { StatusSeedService } from '@/database/seeds/relational/status/status-seed.service'

const runSeed = async () => {
  const app = await NestFactory.create(SeedModule)

  // run seeders
  await app.get(RoleSeedService).run()
  await app.get(StatusSeedService).run()
  await app.get(UserSeedService).run()

  await app.close()
}

void runSeed()
