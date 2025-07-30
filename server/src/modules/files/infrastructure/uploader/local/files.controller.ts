import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiTags,
} from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { FastifyRequest, FastifyReply } from 'fastify'
import { MultipartFile } from '@fastify/multipart'
import { FilesLocalService } from './files.service'
import { FileResponseDto } from './dto/file-response.dto'

@ApiTags('Files')
@Controller({
  path: 'files',
  version: '1',
})
export class FilesLocalController {
  constructor(private readonly filesService: FilesLocalService) {}

  @Post('upload')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiCreatedResponse({ type: FileResponseDto })
  async uploadFile(@Req() req: FastifyRequest): Promise<FileResponseDto> {
    const parts = req.parts()

    for await (const part of parts) {
      // ✅ Verificamos que sea archivo
      if (part.type === 'file') {
        const buffer = await part.toBuffer()

        const file: Express.Multer.File = {
          fieldname: part.fieldname,
          originalname: part.filename,
          encoding: part.encoding,
          mimetype: part.mimetype,
          size: buffer.length,
          buffer,
          stream: part.file,
          destination: '',
          filename: part.filename,
          path: part.filename,
        }

        return this.filesService.create(file)
      }
    }

    throw new HttpException('No file received', HttpStatus.BAD_REQUEST)
  }

  @Get(':path')
  @ApiExcludeEndpoint()
  async download(@Param('path') path: string, @Res() res: FastifyReply) {
    // ✅ usamos reply.sendFile solo si has registrado fastify-static
    // Si no lo has hecho aún:
    // await app.register(require('@fastify/static'), { root: path.resolve('./files'), prefix: '/files/' })
    return res.sendFile(path)
  }
}
