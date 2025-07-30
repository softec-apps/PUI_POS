import {
  HttpStatus,
  Module,
  UnprocessableEntityException,
} from '@nestjs/common'
import { FilesLocalController } from './files.controller'
import { MulterModule } from '@nestjs/platform-express'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { diskStorage } from 'multer'
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util'
import { FilesLocalService } from './files.service'
import { RelationalFilePersistenceModule } from '../../persistence/relational/relational-persistence.module'
import { AllConfigType } from '@/config/config.type'
import * as path from 'path'
import * as fs from 'fs'

const infrastructurePersistenceModule = RelationalFilePersistenceModule

@Module({
  imports: [
    infrastructurePersistenceModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        fileFilter: (req, file, cb) => {
          if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
            return cb(
              new UnprocessableEntityException({
                status: HttpStatus.UNPROCESSABLE_ENTITY,
                errors: { file: 'cantUploadFileType' },
              }),
              false,
            )
          }
          cb(null, true)
        },
        storage: diskStorage({
          destination: (req, file, cb) => {
            // 👇 CORREGIDO: Crear directorio si no existe y usar ruta absoluta
            const uploadPath = path.resolve('./files')

            if (!fs.existsSync(uploadPath)) {
              fs.mkdirSync(uploadPath, { recursive: true })
            }
            cb(null, uploadPath)
          },
          filename: (req, file, cb) => {
            // 👇 CORREGIDO: Generar nombre único
            const uniqueName = `${randomStringGenerator()}.${file.originalname.split('.').pop()?.toLowerCase()}`
            cb(null, uniqueName)
          },
        }),
        limits: {
          fileSize: configService.get('file.maxFileSize', { infer: true }),
        },
      }),
    }),
  ],
  controllers: [FilesLocalController],
  providers: [ConfigModule, ConfigService, FilesLocalService],
  exports: [FilesLocalService],
})
export class FilesLocalModule {}
