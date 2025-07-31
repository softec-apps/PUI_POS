import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FileRepository } from '../../persistence/file.repository'
import { AllConfigType } from '@/config/config.type'
import { FileType } from '../../../domain/file'

@Injectable()
export class FilesLocalService {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly fileRepository: FileRepository,
  ) {}

  async create(file: Express.Multer.File): Promise<{ file: FileType }> {
    if (!file) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          file: 'selectFile',
        },
      })
    }

    // 👇 CORREGIDO: Usar file.filename que contiene el nombre único generado por Multer
    const fileName = file.filename // Este ya es el nombre único generado en el storage

    const apiPrefix = this.configService.get('app.apiPrefix', { infer: true })
    const finalPath = `/${apiPrefix}/v1/files/${fileName}`

    const result = await this.fileRepository.create({
      path: finalPath,
    })

    return {
      file: result,
    }
  }
}
