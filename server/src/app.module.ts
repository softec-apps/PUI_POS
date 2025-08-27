import path from 'path'

import { Module } from '@nestjs/common'
import appConfig from '@/config/app.config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { HeaderResolver, I18nModule } from 'nestjs-i18n'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { LoggerModule } from 'pino-nestjs'
import { DataSource, DataSourceOptions } from 'typeorm'

import { AllConfigType } from '@/config/config.type'
import { HomeModule } from '@/modules/home/home.module'
import { MailModule } from '@/modules/mail/mail.module'
import { AuthModule } from '@/modules/auth/auth.module'
import authConfig from '@/modules/auth/config/auth.config'
import { UsersModule } from '@/modules/users/users.module'
import { FilesModule } from '@/modules/files/files.module'
import mailConfig from '@/modules/mail/config/mail.config'
import fileConfig from '@/modules/files/config/file.config'
import { MailerModule } from '@/modules/mailer/mailer.module'
import databaseConfig from '@/database/config/database.config'
import { SessionModule } from '@/modules/session/session.module'
import { KardexModule } from '@/modules/kardex/kardex.module'
import { CustomerModule } from '@/modules/customer/customer.module'
import googleConfig from '@/modules/auth-google/config/google.config'
import { TypeOrmConfigService } from '@/database/typeorm-config.service'
import { AttributesModule } from '@/modules/atributes/atributes.module'
import { CategoriesModule } from '@/modules/categories/categories.module'
import { BrandModule } from '@/modules/brand/brand.module'
import { ProductModule } from '@/modules/product/product.module'
import { ImportProductModule } from '@/modules/product/import.module'
import { SaleModule } from '@/modules/sales/sale.module'
import { SupplierModule } from '@/modules/suppliers/supplier.module'
import { EstablishmentModule } from '@/modules/establishment/establishment.module'
import { AuthGoogleModule } from '@/modules/auth-google/auth-google.module'
import { TemplateProductModule } from '@/modules/template/templates.module'

const infrastructureDatabaseModule = TypeOrmModule.forRootAsync({
  useClass: TypeOrmConfigService,
  dataSourceFactory: async (options: DataSourceOptions) => {
    return new DataSource(options).initialize()
  },
})

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: 'info',
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  levelFirst: true,
                  translateTime: 'yyyy-mm-dd HH:MM:ss.l',
                  ignore: 'pid,hostname',
                },
              }
            : undefined,
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        authConfig,
        appConfig,
        mailConfig,
        fileConfig,
        googleConfig,
      ],
      envFilePath: ['.env'],
    }),
    infrastructureDatabaseModule,
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        fallbackLanguage: configService.getOrThrow('app.fallbackLanguage', {
          infer: true,
        }),
        loaderOptions: { path: path.join(__dirname, '/i18n/'), watch: true },
      }),
      resolvers: [
        {
          use: HeaderResolver,
          useFactory: (configService: ConfigService<AllConfigType>) => {
            return [
              configService.get('app.headerLanguage', {
                infer: true,
              }),
            ]
          },
          inject: [ConfigService],
        },
      ],
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
    UsersModule,
    FilesModule,
    AuthModule,
    AuthGoogleModule,
    SessionModule,
    MailModule,
    MailerModule,
    HomeModule,
    CategoriesModule,
    SupplierModule,
    ProductModule,
    ImportProductModule,
    AttributesModule,
    BrandModule,
    EstablishmentModule,
    KardexModule,
    TemplateProductModule,
    CustomerModule,
    SaleModule,
  ],
})
export class AppModule {}
