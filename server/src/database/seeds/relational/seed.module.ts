import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DataSource, DataSourceOptions } from 'typeorm'

import appConfig from '@/config/app.config'
import databaseConfig from '@/database/config/database.config'
import { TypeOrmConfigService } from '@/database/typeorm-config.service'

import { RoleSeedModule } from '@/database/seeds/relational/role/role-seed.module'
import { UserSeedModule } from '@/database/seeds/relational/user/user-seed.module'
import { StatusSeedModule } from '@/database/seeds/relational/status/status-seed.module'
import { CustomerSeedModule } from '@/database/seeds/relational/customer/customer-seed.module'

@Module({
  imports: [
    RoleSeedModule,
    StatusSeedModule,
    UserSeedModule,
    CustomerSeedModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig],
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize()
      },
    }),
  ],
})
export class SeedModule {}
