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
    console.log('=== SERVICE CREATE DEBUG ===')
    console.log('File received:', !!file)

    if (!file) {
      console.log('ERROR: No file received')
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          file: 'selectFile',
        },
      })
    }

    console.log('Original name:', file.originalname)
    console.log('Generated filename:', file.filename)
    console.log('File size:', file.size)
    console.log('File path:', file.path)
    console.log('File destination:', file.destination)
    console.log('File mimetype:', file.mimetype)

    // 👇 CORREGIDO: Usar file.filename que contiene el nombre único generado por Multer
    const fileName = file.filename // Este ya es el nombre único generado en el storage
    console.log('Final filename for DB:', fileName)

    const apiPrefix = this.configService.get('app.apiPrefix', { infer: true })
    const finalPath = `/${apiPrefix}/v1/files/${fileName}`
    console.log('Final path for DB:', finalPath)
    console.log('==========================')

    const result = await this.fileRepository.create({
      path: finalPath,
    })

    console.log('=== DB RESULT ===')
    console.log('Saved to DB:', result)
    console.log('================')

    return {
      file: result,
    }
  }
}
